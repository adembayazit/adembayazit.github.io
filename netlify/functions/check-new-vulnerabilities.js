const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // Environment variables
    const {
      JSONBIN_MASTER_KEY,
      VULNERABILITIES_BIN_ID,
      SUBSCRIBERS_BIN_ID,
      MAILJET_API_KEY,
      MAILJET_SECRET_KEY
    } = process.env;

    // 1. Son kontrol verilerini al
    const subscribersData = await getSubscribersData(SUBSCRIBERS_BIN_ID, JSONBIN_MASTER_KEY);
    const lastChecked = new Date(subscribersData.last_checked);
    const lastVulnId = subscribersData.last_vulnerability_id;

    // 2. Tüm vulnerabiliteleri al
    const vulnerabilities = await getVulnerabilities(VULNERABILITIES_BIN_ID, JSONBIN_MASTER_KEY);
    
    // 3. Yeni vulnerabiliteleri bul (son kontrol tarihinden sonra eklenenler)
    const newVulnerabilities = vulnerabilities.filter(vuln => {
      const vulnDate = new Date(vuln.date);
      return vulnDate > lastChecked || vuln.id > lastVulnId;
    });

    console.log(`Found ${newVulnerabilities.length} new vulnerabilities`);

    // 4. Yeni vulnerabiliteler varsa işle
    if (newVulnerabilities.length > 0) {
      for (const vuln of newVulnerabilities) {
        await sendNotificationEmail(vuln, subscribersData.subscribers, MAILJET_API_KEY, MAILJET_SECRET_KEY);
        console.log(`Notification sent for vulnerability: ${vuln.title}`);
      }

      // 5. Son kontrol verilerini güncelle
      const latestVulnId = Math.max(...vulnerabilities.map(v => v.id));
      await updateSubscribersData(SUBSCRIBERS_BIN_ID, JSONBIN_MASTER_KEY, {
        subscribers: subscribersData.subscribers,
        last_checked: new Date().toISOString(),
        last_vulnerability_id: latestVulnId,
        settings: subscribersData.settings
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Checked for new vulnerabilities. Found ${newVulnerabilities.length} new ones.`
      })
    };
  } catch (error) {
    console.error('Error in check-new-vulnerabilities:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function getSubscribersData(binId, masterKey) {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: {
      'X-Master-Key': masterKey
    }
  });
  const data = await response.json();
  return data.record;
}

async function getVulnerabilities(binId, masterKey) {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: {
      'X-Master-Key': masterKey
    }
  });
  const data = await response.json();
  return data.record.records || data.record;
}

async function sendNotificationEmail(vulnerability, subscribers, apiKey, secretKey) {
  const Mailjet = require('node-mailjet');
  const mailjet = Mailjet.apiConnect(apiKey, secretKey);

  const emailData = {
    Messages: [
      {
        From: {
          Email: "noreply@adembayazit.com",
          Name: "Adem Bayazıt - Vulnerabilities Research"
        },
        To: subscribers.map(email => ({ Email: email })),
        Subject: `Yeni Vulnerability: ${vulnerability.title}`,
        HTMLPart: createEmailHTML(vulnerability)
      }
    ]
  };

  return await mailjet.post('send', { version: 'v3.1' }).request(emailData);
}

function createEmailHTML(vulnerability) {
  return `
    <h2>Yeni Vulnerability Yayınlandı</h2>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px;">
      <h3 style="color: #d9534f;">${vulnerability.title}</h3>
      <p><strong>Tarih:</strong> ${new Date(vulnerability.date).toLocaleDateString('tr-TR')}</p>
      ${vulnerability.cvss_score ? `<p><strong>CVSS Skoru:</strong> ${vulnerability.cvss_score}</p>` : ''}
      <p>${vulnerability.content.substring(0, 200)}...</p>
      <a href="https://adembayazit.com/vulnerabilities#${vulnerability.id}" 
         style="background: #00cc00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Tam Araştırmayı Oku
      </a>
    </div>
    <p style="margin-top: 20px; color: #666; font-size: 12px;">
      Bu bildirimi aldınız çünkü Adem Bayazıt'ın vulnerability araştırmalarına abone oldunuz.
      <br><a href="https://adembayazit.com/unsubscribe" style="color: #666;">Aboneliği iptal et</a>
    </p>
  `;
}

async function updateSubscribersData(binId, masterKey, newData) {
  await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': masterKey
    },
    body: JSON.stringify(newData)
  });
}

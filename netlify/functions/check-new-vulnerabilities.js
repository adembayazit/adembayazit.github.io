const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // 1. Son kontrol tarihini al
    const subscribersData = await getSubscribersData();
    const lastChecked = subscribersData.last_checked;
    const lastVulnId = subscribersData.last_vulnerability_id;

    // 2. Tüm vulnerabiliteleri al
    const vulnerabilities = await getVulnerabilities();
    
    // 3. Yeni vulnerabiliteleri bul (son kontrol tarihinden sonra eklenenler)
    const newVulnerabilities = vulnerabilities.filter(vuln => {
      return new Date(vuln.date) > new Date(lastChecked) || vuln.id > lastVulnId;
    });

    // 4. Yeni vulnerabiliteler varsa mail gönder
    if (newVulnerabilities.length > 0) {
      for (const vuln of newVulnerabilities) {
        await sendNotificationEmail(vuln, subscribersData.subscribers);
      }

      // 5. Son kontrol tarihini güncelle
      const latestVulnId = Math.max(...vulnerabilities.map(v => v.id));
      await updateSubscribersData({
        last_checked: new Date().toISOString(),
        last_vulnerability_id: latestVulnId,
        subscribers: subscribersData.subscribers
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Checked for new vulnerabilities. Found ${newVulnerabilities.length} new ones.`
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function getSubscribersData() {
  // JSON Bin'den subscribers verisini al
  const response = await fetch(`https://api.jsonbin.io/v3/b/${process.env.SUBSCRIBERS_BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': process.env.JSONBIN_MASTER_KEY
    }
  });
  return await response.json();
}

async function getVulnerabilities() {
  // JSON Bin'den vulnerabilities verisini al
  const response = await fetch(`https://api.jsonbin.io/v3/b/${process.env.VULNERABILITIES_BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': process.env.JSONBIN_MASTER_KEY
    }
  });
  const data = await response.json();
  return data.records || data;
}

async function sendNotificationEmail(vulnerability, subscribers) {
  // Mailjet ile mail gönder
  const mailjet = require('node-mailjet').apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );

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
  `;
}

async function updateSubscribersData(newData) {
  // JSON Bin'i güncelle
  await fetch(`https://api.jsonbin.io/v3/b/${process.env.SUBSCRIBERS_BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': process.env.JSONBIN_MASTER_KEY
    },
    body: JSON.stringify(newData)
  });
}

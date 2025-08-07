// Admin kontrolü
if(!localStorage.getItem('adminAuthenticated')) {
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = "index.html";
}

// Formatlama fonksiyonları
function formatText(textareaId, format) {
    const textarea = document.getElementById(textareaId);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    
    switch(format) {
        case 'bold':
            formattedText = `<b>${selectedText}</b>`;
            break;
        case 'italic':
            formattedText = `<i>${selectedText}</i>`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        case 'quote':
            formattedText = `"${selectedText}"`;
            break;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
}

function clearFormatting(textareaId) {
    const textarea = document.getElementById(textareaId);
    const text = textarea.value;
    textarea.value = text.replace(/<\/?[^>]+(>|$)/g, ""); // Tüm HTML tag'larını temizle
}

// Entry gönderme fonksiyonu
async function submitEntry() {
    const trContent = document.getElementById('trContent').value.trim();
    const enContent = document.getElementById('enContent').value.trim();
    const referenceId = document.getElementById('referenceId').value;
    
    if(!trContent && !enContent) {
        alert("En az bir dilde içerik girmelisiniz!");
        return;
    }

    try {
        // Mevcut entry'leri çek
        const response = await fetch('https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '/b/68933248ae596e708fc2fbbc/latest',
                method: 'GET'
            })
        });
        
        if (!response.ok) throw new Error('Veri alınamadı');
        
        const data = await response.json();
        const entries = data.records || data;
        const maxId = Math.max(...entries.map(e => e.id), 0);
        
        // Yeni entry objesi
        const newEntry = {
            id: maxId + 1,
            date: new Date().toISOString(),
            content: enContent,
            content_tr: trContent,
            references: referenceId ? [parseInt(referenceId)] : []
        };
        
        // Yeni entry'yi ekleyerek güncelle
        const updatedEntries = [...entries, newEntry];
        
        // JSONBin.io'ya gönder
        const updateResponse = await fetch('https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '/b/68933248ae596e708fc2fbbc',
                method: 'PUT',
                body: updatedEntries
            })
        });
        
        if (!updateResponse.ok) throw new Error('Güncelleme başarısız');
        
        alert("Entry başarıyla eklendi!");
        document.getElementById('trContent').value = '';
        document.getElementById('enContent').value = '';
        document.getElementById('referenceId').value = '';
        
        // İstatistikleri güncelle
        updateStats();
        
    } catch (error) {
        console.error('Hata:', error);
        alert("Bir hata oluştu: " + error.message);
        
        // Fallback olarak local storage'a kaydet
        try {
            const localEntries = JSON.parse(localStorage.getItem('entries_backup') || '[]');
            const maxId = Math.max(...localEntries.map(e => e.id), 0);
            
            const newEntry = {
                id: maxId + 1,
                date: new Date().toISOString(),
                content: enContent,
                content_tr: trContent,
                references: referenceId ? [parseInt(referenceId)] : []
            };
            
            localStorage.setItem('entries_backup', JSON.stringify([...localEntries, newEntry]));
            alert("Entry local storage'a yedeklendi!");
        } catch (e) {
            console.error('Local storage hatası:', e);
        }
    }
}

// İstatistikleri güncelle
async function updateStats() {
    try {
        // Entry sayısı
        const entriesResponse = await fetch('https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '/b/68933248ae596e708fc2fbbc/latest',
                method: 'GET'
            })
        });
        
        if (entriesResponse.ok) {
            const entriesData = await entriesResponse.json();
            const entries = entriesData.records || entriesData;
            document.getElementById('total-entries').textContent = entries.length;
        }
        
        // Like ve pin istatistikleri
        const statsResponse = await fetch('https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '/b/68862fd97b4b8670d8a81945/latest',
                method: 'GET'
            })
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const likes = statsData.likes || {};
            const pins = statsData.pins || {};
            
            const totalLikes = Object.values(likes).reduce((sum, count) => sum + count, 0);
            const totalPins = Object.values(pins).reduce((sum, count) => sum + count, 0);
            
            document.getElementById('total-likes').textContent = totalLikes;
            document.getElementById('total-pins').textContent = totalPins;
        }
        
    } catch (error) {
        console.error('İstatistik güncelleme hatası:', error);
    }
}

// Sayfa yüklendiğinde istatistikleri güncelle
document.addEventListener('DOMContentLoaded', updateStats);

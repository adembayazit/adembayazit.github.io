<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Paneli - adembayazit.com</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: limegreen;
            --secondary-color: #001e00;
            --text-color: limegreen;
            --bg-color: #000;
            --error-color: #ff3333;
            --success-color: #00ff00;
        }
        
        body {
            background: var(--bg-color);
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }
        
        .admin-header {
            background: rgba(0, 30, 0, 0.9);
            border-bottom: 1px solid var(--primary-color);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo img {
            height: 40px;
            filter: drop-shadow(0 0 5px var(--primary-color));
        }
        
        .logo h2 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .bug-icon {
            color: red;
            animation: bugPulse 1.5s infinite;
        }
        
        .logout-btn {
            background: var(--primary-color);
            color: black;
            border: none;
            padding: 8px 15px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 3px;
            transition: all 0.3s;
        }
        
        .logout-btn:hover {
            box-shadow: 0 0 10px var(--primary-color);
            transform: translateY(-2px);
        }
        
        .admin-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            padding: 2rem;
        }
        
        .editor-container, .stats-container, .entries-list {
            background: rgba(0, 30, 0, 0.7);
            border: 1px solid var(--primary-color);
            border-radius: 5px;
            padding: 1.5rem;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .editor-container::after, .stats-container::after, .entries-list::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
            animation: scanline 3s linear infinite;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        
        input[type="number"], textarea, select {
            width: 100%;
            padding: 10px;
            background: #111;
            border: 1px solid var(--primary-color);
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            border-radius: 3px;
        }
        
        textarea {
            min-height: 150px;
            resize: vertical;
        }
        
        .editor-toolbar {
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
        }
        
        .editor-toolbar button {
            background: #111;
            border: 1px solid var(--primary-color);
            color: var(--text-color);
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }
        
        .editor-toolbar button:hover {
            background: var(--primary-color);
            color: black;
        }
        
        .submit-btn, .load-btn {
            background: var(--primary-color);
            color: black;
            border: none;
            padding: 10px 20px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 3px;
            transition: all 0.3s;
            width: 100%;
            justify-content: center;
            margin-top: 10px;
        }
        
        .submit-btn:hover, .load-btn:hover {
            box-shadow: 0 0 15px var(--primary-color);
            transform: translateY(-2px);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
        }
        
        .stat-box {
            background: rgba(0, 30, 0, 0.5);
            border: 1px solid var(--primary-color);
            padding: 1rem;
            text-align: center;
            border-radius: 3px;
        }
        
        .stat-box i {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }
        
        .stat-box span {
            display: block;
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        #response-message {
            padding: 10px;
            margin-top: 15px;
            border-radius: 3px;
            text-align: center;
            display: none;
        }
        
        .success {
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid var(--success-color);
            color: var(--success-color);
        }
        
        .error {
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid var(--error-color);
            color: var(--error-color);
        }
        
        .entry-item {
            border-bottom: 1px dashed var(--primary-color);
            padding: 1rem 0;
            margin-bottom: 1rem;
        }
        
        .entry-item:last-child {
            border-bottom: none;
        }
        
        .entry-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .entry-id {
            color: var(--primary-color);
            font-weight: bold;
        }
        
        .entry-date {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .entry-content {
            margin-bottom: 0.5rem;
        }
        
        .entry-actions {
            display: flex;
            gap: 10px;
        }
        
        .entry-actions button {
            background: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            padding: 3px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .entry-actions button:hover {
            background: var(--primary-color);
            color: black;
        }
        
        @keyframes scanline {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        @keyframes bugPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .admin-container {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header class="admin-header">
        <div class="logo">
            <img src="../IMAGES/hackerwhite.svg" alt="adembayazit.com" class="hacker-icon">
            <h2>LadyB<span class="fa-solid fa-bug bug-icon"></span>G Admin</h2>
        </div>
        <button class="logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</button>
    </header>

    <div class="admin-container">
        <div class="editor-container">
            <h3><i class="fas fa-plus-circle"></i> Yeni Entry Ekle</h3>
            
            <div class="form-group">
                <label for="referenceId"><i class="fas fa-link"></i> Referans ID (opsiyonel):</label>
                <input type="number" id="referenceId" placeholder="Referans ID">
            </div>
            
            <div class="form-group">
                <label for="entryLang"><i class="fas fa-language"></i> Dil:</label>
                <select id="entryLang">
                    <option value="tr">Türkçe</option>
                    <option value="en">İngilizce</option>
                    <option value="both">Her İkisi</option>
                </select>
            </div>
            
            <div class="form-group" id="trContentGroup">
                <label for="trContent"><i class="fas fa-language"></i> Türkçe İçerik:</label>
                <div class="editor-toolbar">
                    <button onclick="formatText('trContent', 'bold')" title="Kalın"><i class="fas fa-bold"></i></button>
                    <button onclick="formatText('trContent', 'italic')" title="İtalik"><i class="fas fa-italic"></i></button>
                    <button onclick="formatText('trContent', 'underline')" title="Altı Çizili"><i class="fas fa-underline"></i></button>
                    <button onclick="formatText('trContent', 'quote')" title="Tırnak İşareti"><i class="fas fa-quote-right"></i></button>
                    <button onclick="insertParagraph('trContent')" title="Paragraf Ekle"><i class="fas fa-paragraph"></i></button>
                    <button onclick="clearFormatting('trContent')" title="Temizle"><i class="fas fa-eraser"></i></button>
                </div>
                <textarea id="trContent" placeholder="Türkçe içerik..."></textarea>
            </div>
            
            <div class="form-group" id="enContentGroup" style="display:none;">
                <label for="enContent"><i class="fas fa-globe"></i> İngilizce İçerik:</label>
                <div class="editor-toolbar">
                    <button onclick="formatText('enContent', 'bold')" title="Bold"><i class="fas fa-bold"></i></button>
                    <button onclick="formatText('enContent', 'italic')" title="Italic"><i class="fas fa-italic"></i></button>
                    <button onclick="formatText('enContent', 'underline')" title="Underline"><i class="fas fa-underline"></i></button>
                    <button onclick="formatText('enContent', 'quote')" title="Quote"><i class="fas fa-quote-right"></i></button>
                    <button onclick="insertParagraph('enContent')" title="Add Paragraph"><i class="fas fa-paragraph"></i></button>
                    <button onclick="clearFormatting('enContent')" title="Clear"><i class="fas fa-eraser"></i></button>
                </div>
                <textarea id="enContent" placeholder="English content..."></textarea>
            </div>
            
            <button class="submit-btn" onclick="submitEntry()"><i class="fas fa-paper-plane"></i> Entry Ekle</button>
            <div id="response-message"></div>
        </div>
        
        <div class="stats-container">
            <h3><i class="fas fa-chart-bar"></i> İstatistikler</h3>
            <div class="stats-grid">
                <div class="stat-box">
                    <i class="fas fa-heart"></i>
                    <span id="total-likes">0</span>
                    <small>Toplam Beğeni</small>
                </div>
                <div class="stat-box">
                    <i class="fas fa-thumbtack"></i>
                    <span id="total-pins">0</span>
                    <small>Toplam Pin</small>
                </div>
                <div class="stat-box">
                    <i class="fas fa-file-alt"></i>
                    <span id="total-entries">0</span>
                    <small>Toplam Entry</small>
                </div>
            </div>
            <button class="load-btn" onclick="loadEntries()"><i class="fas fa-sync-alt"></i> Entryleri Yenile</button>
        </div>
        
        <div class="entries-list">
            <h3><i class="fas fa-list"></i> Son Entryler</h3>
            <div id="entries-container"></div>
        </div>
    </div>

    <script>
        // JSON veri yapısı
        let entriesData = [];
        
        // Dil seçimine göre içerik alanlarını göster/gizle
        document.getElementById('entryLang').addEventListener('change', function() {
            const lang = this.value;
            document.getElementById('trContentGroup').style.display = (lang === 'en') ? 'none' : 'block';
            document.getElementById('enContentGroup').style.display = (lang === 'tr') ? 'none' : 'block';
        });
        
        // Oturum kontrolü
        window.addEventListener('DOMContentLoaded', () => {
            if (!localStorage.getItem('adminAuth') || localStorage.getItem('adminAuth') !== 'true') {
                window.location.href = 'admin.html';
            } else {
                loadStats();
                loadEntries();
            }
        });
        
        // Entry yükleme
        async function loadEntries() {
            try {
                const response = await fetch('entries.json');
                entriesData = await response.json();
                displayEntries(entriesData.slice(0, 5)); // Son 5 entry göster
                updateStats();
            } catch (error) {
                console.error('Entry yükleme hatası:', error);
                showMessage('Entryler yüklenirken hata oluştu!', 'error');
            }
        }
        
        // Entryleri görüntüleme
        function displayEntries(entries) {
            const container = document.getElementById('entries-container');
            container.innerHTML = '';
            
            entries.forEach(entry => {
                const entryEl = document.createElement('div');
                entryEl.className = 'entry-item';
                
                const references = entry.references?.length > 0 ? 
                    `Referans: #${entry.references.join(', #')}` : '';
                
                entryEl.innerHTML = `
                    <div class="entry-header">
                        <span class="entry-id">#${entry.id}</span>
                        <span class="entry-date">${new Date(entry.date).toLocaleString('tr-TR')}</span>
                    </div>
                    <div class="entry-content">${entry.content_tr || entry.content}</div>
                    ${references ? `<div class="entry-ref">${references}</div>` : ''}
                    <div class="entry-actions">
                        <button onclick="editEntry(${entry.id})"><i class="fas fa-edit"></i> Düzenle</button>
                        <button onclick="deleteEntry(${entry.id})"><i class="fas fa-trash"></i> Sil</button>
                    </div>
                `;
                
                container.appendChild(entryEl);
            });
        }
        
        // Entry ekleme
        async function submitEntry() {
            const referenceId = document.getElementById('referenceId').value;
            const trContent = document.getElementById('trContent').value;
            const enContent = document.getElementById('enContent').value;
            const lang = document.getElementById('entryLang').value;
            const responseEl = document.getElementById('response-message');
            
            responseEl.style.display = 'none';
            
            if ((lang === 'tr' || lang === 'both') && !trContent) {
                showMessage('Lütfen Türkçe içerik girin!', 'error');
                return;
            }
            
            if ((lang === 'en' || lang === 'both') && !enContent) {
                showMessage('Lütfen İngilizce içerik girin!', 'error');
                return;
            }
            
            try {
                const submitBtn = document.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
                
                // Yeni entry oluştur
                const newEntry = {
                    id: generateId(),
                    date: new Date().toISOString(),
                    content: lang === 'tr' ? trContent : enContent,
                    content_tr: lang !== 'en' ? trContent : null,
                    content_en: lang !== 'tr' ? enContent : null,
                    references: referenceId ? [parseInt(referenceId)] : [],
                    lang: lang === 'both' ? 'tr' : lang
                };
                
                // Mevcut entry'lere ekle
                entriesData.unshift(newEntry);
                
                // Burada gerçekte API'ye göndermeniz gerekir
                // await saveEntriesToServer(entriesData);
                
                showMessage('Entry başarıyla eklendi!', 'success');
                
                // Formu temizle
                document.getElementById('referenceId').value = '';
                document.getElementById('trContent').value = '';
                document.getElementById('enContent').value = '';
                
                // Listeyi güncelle
                displayEntries(entriesData.slice(0, 5));
                updateStats();
            } catch (error) {
                showMessage(`Hata: ${error.message}`, 'error');
                console.error('Entry ekleme hatası:', error);
            } finally {
                const submitBtn = document.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Entry Ekle';
            }
        }
        
        // ID üretme
        function generateId() {
            const maxId = Math.max(...entriesData.map(e => e.id), 0);
            return maxId + 1;
        }
        
        // İstatistikleri güncelle
        function updateStats() {
            document.getElementById('total-entries').textContent = entriesData.length;
            // Beğeni ve pin istatistikleri için ek mantık ekleyebilirsiniz
        }
        
        // Entry düzenleme
        function editEntry(id) {
            const entry = entriesData.find(e => e.id === id);
            if (!entry) return;
            
            document.getElementById('referenceId').value = entry.references?.[0] || '';
            document.getElementById('trContent').value = entry.content_tr || '';
            document.getElementById('enContent').value = entry.content_en || '';
            
            if (entry.content_tr && entry.content_en) {
                document.getElementById('entryLang').value = 'both';
                document.getElementById('trContentGroup').style.display = 'block';
                document.getElementById('enContentGroup').style.display = 'block';
            } else if (entry.content_en) {
                document.getElementById('entryLang').value = 'en';
                document.getElementById('trContentGroup').style.display = 'none';
                document.getElementById('enContentGroup').style.display = 'block';
            } else {
                document.getElementById('entryLang').value = 'tr';
                document.getElementById('trContentGroup').style.display = 'block';
                document.getElementById('enContentGroup').style.display = 'none';
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showMessage(`#${id} numaralı entry düzenleniyor...`, 'success');
        }
        
        // Entry silme
        async function deleteEntry(id) {
            if (!confirm(`#${id} numaralı entryi silmek istediğinize emin misiniz?`)) return;
            
            try {
                entriesData = entriesData.filter(e => e.id !== id);
                // await saveEntriesToServer(entriesData);
                showMessage(`#${id} numaralı entry silindi!`, 'success');
                displayEntries(entriesData.slice(0, 5));
                updateStats();
            } catch (error) {
                showMessage(`Silme hatası: ${error.message}`, 'error');
                console.error('Entry silme hatası:', error);
            }
        }
        
        // Mesaj gösterme
        function showMessage(message, type) {
            const responseEl = document.getElementById('response-message');
            responseEl.textContent = message;
            responseEl.className = type;
            responseEl.style.display = 'block';
            
            setTimeout(() => {
                responseEl.style.display = 'none';
            }, 5000);
        }
        
        function logout() {
            localStorage.removeItem('adminAuth');
            window.location.href = 'login.html';
        }
        
        // Metin düzenleme fonksiyonları
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
                    formattedText = `<blockquote>${selectedText}</blockquote>`;
                    break;
            }
            
            textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }
        
        function insertParagraph(textareaId) {
            const textarea = document.getElementById(textareaId);
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            
            const formattedText = `<p style="margin-bottom: 1em">${selectedText}</p>`;
            
            textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }
        
        function clearFormatting(textareaId) {
            const textarea = document.getElementById(textareaId);
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            
            const cleanedText = selectedText
                .replace(/<b>/g, '').replace(/<\/b>/g, '')
                .replace(/<i>/g, '').replace(/<\/i>/g, '')
                .replace(/<u>/g, '').replace(/<\/u>/g, '')
                .replace(/<blockquote>/g, '').replace(/<\/blockquote>/g, '')
                .replace(/<p style="margin-bottom: 1em">/g, '').replace(/<\/p>/g, '');
                
            textarea.value = textarea.value.substring(0, start) + cleanedText + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + cleanedText.length, start + cleanedText.length);
        }
    </script>
</body>
</html>

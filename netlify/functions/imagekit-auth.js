<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ImageKit Upload Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 50px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
        .container { background: #1e293b; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: 1px solid #334155; }
        h1 { color: #60a5fa; text-align: center; margin-bottom: 30px; text-shadow: 0 0 10px rgba(96, 165, 250, 0.3); }
        .btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 8px 5px; transition: all 0.3s; font-weight: bold; }
        .btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
        .btn:disabled { background: #475569; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-success { background: #10b981; }
        .btn-success:hover { background: #059669; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
        .btn-warning { background: #f59e0b; }
        .btn-warning:hover { background: #d97706; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
        .log-container { background: #0f172a; border: 2px solid #334155; border-radius: 10px; padding: 20px; margin-top: 25px; max-height: 500px; overflow-y: auto; font-family: 'Fira Code', 'Courier New', monospace; font-size: 14px; line-height: 1.5; }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .info { color: #60a5fa; }
        .debug { color: #94a3b8; }
        .warning { color: #f59e0b; }
        .file-input { margin: 20px 0; padding: 15px; border: 2px dashed #475569; border-radius: 8px; background: #1e293b; }
        .status { padding: 12px; border-radius: 6px; margin: 12px 0; font-weight: bold; background: #334155; }
        .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #60a5fa; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .config-box { background: #334155; padding: 15px; border-radius: 8px; margin: 15px 0; font-family: 'Fira Code', monospace; font-size: 13px; }
        .section { margin: 25px 0; padding: 20px; background: #1e293b; border-radius: 10px; border-left: 4px solid #3b82f6; }
        .key-input { width: 100%; padding: 10px; margin: 10px 0; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 5px; font-family: 'Fira Code', monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 ImageKit Upload Test Merkezi</h1>
        
        <div class="section">
            <h3>🔑 Private Key Ayarları</h3>
            <p>ImageKit Dashboard → Settings → API Keys → Private Key</p>
            <input type="password" id="privateKeyInput" class="key-input" placeholder="private_ ile başlayan key'i buraya yapıştırın">
            <button class="btn btn-success" onclick="savePrivateKey()">💾 Key'i Kaydet</button>
            <div id="keyStatus"></div>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
            <button class="btn" onclick="testAuth()" id="authBtn">1. 🔑 Auth Testi</button>
            <button class="btn" onclick="testUpload()" id="uploadBtn">2. 📤 Upload Testi</button>
            <button class="btn btn-warning" onclick="testManualSignature()" id="manualSigBtn">3. 🔐 Manuel Signature Testi</button>
            <button class="btn btn-danger" onclick="clearLog()">🗑️ Temizle</button>
        </div>

        <div class="file-input">
            <h3>📂 Test için Dosya Seçin:</h3>
            <input type="file" id="testFile" accept=".txt,.jpg,.jpeg,.png,.pdf,.mp4">
            <div id="fileInfo"></div>
        </div>

        <div class="section">
            <h3>📊 Detaylı Loglar:</h3>
            <div class="log-container" id="log"></div>
        </div>
    </div>

    <script>
        const logElement = document.getElementById('log');
        const authBtn = document.getElementById('authBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const manualSigBtn = document.getElementById('manualSigBtn');
        const fileInfo = document.getElementById('fileInfo');
        const privateKeyInput = document.getElementById('privateKeyInput');
        const keyStatus = document.getElementById('keyStatus');
        
        const MANUAL_PUBLIC_KEY = 'public_tHOgsielmH7GLPe3fLQkHMUztUY=';
        let MANUAL_PRIVATE_KEY = localStorage.getItem('imagekit_private_key') || '';
        if (MANUAL_PRIVATE_KEY) {
            privateKeyInput.value = MANUAL_PRIVATE_KEY;
        }

        function log(message, className = '') {
            const line = document.createElement('div');
            line.innerHTML = `<strong>${new Date().toLocaleTimeString()}</strong> - ${message}`;
            if (className) line.className = className;
            logElement.appendChild(line);
            logElement.scrollTop = logElement.scrollHeight;
            console.log(message);
        }

        function clearLog() {
            logElement.innerHTML = '';
        }

        function setLoading(button, isLoading) {
            if (isLoading) {
                button.innerHTML = '<span class="loading"></span> İşleniyor...';
                button.disabled = true;
            } else {
                button.innerHTML = button.getAttribute('data-original');
                button.disabled = false;
            }
        }

        function savePrivateKey() {
            const key = privateKeyInput.value.trim();
            
            if (!key) {
                keyStatus.innerHTML = '<div class="error">❌ Lütfen private key girin!</div>';
                return;
            }
            
            if (!key.startsWith('private_')) {
                keyStatus.innerHTML = '<div class="error">❌ Private key "private_" ile başlamalı!</div>';
                return;
            }
            
            MANUAL_PRIVATE_KEY = key;
            localStorage.setItem('imagekit_private_key', key);
            
            keyStatus.innerHTML = `<div class="success">✅ Key kaydedildi! (${key.length} karakter)</div>`;
            log(`🔑 Private Key kaydedildi: ${key.substring(0, 15)}... (${key.length} karakter)`, 'success');
        }

        async function testPrivateKey() {
            if (!MANUAL_PRIVATE_KEY) {
                log('❌ HATA: Private key ayarlanmamış!', 'error');
                return false;
            }
            
            log('🔐 Private Key Kontrolü...', 'info');
            log(`🔑 Private Key: ${MANUAL_PRIVATE_KEY.substring(0, 15)}...`, 'debug');
            log(`📏 Uzunluk: ${MANUAL_PRIVATE_KEY.length} karakter`, 'debug');
            
            if (!MANUAL_PRIVATE_KEY.startsWith('private_')) {
                log('❌ HATA: Private key "private_" ile başlamalı!', 'error');
                return false;
            }
            
            log('✅ Private key formatı uygun', 'success');
            return true;
        }

        // Base64 encoding function
        function base64Encode(str) {
            return btoa(unescape(encodeURIComponent(str)));
        }

        async function testManualSignature() {
            if (!await testPrivateKey()) {
                return;
            }
            
            setLoading(manualSigBtn, true);
            
            try {
                log('🔐 Manuel signature testi başlıyor...', 'info');
                
                // Private key sonuna : ekleyip base64 encode et
                const privateKeyWithColon = MANUAL_PRIVATE_KEY + ':';
                const encodedPrivateKey = base64Encode(privateKeyWithColon);
                
                log(`🔑 Private Key with colon: ${privateKeyWithColon.substring(0, 20)}...`, 'debug');
                log(`🔐 Base64 Encoded: ${encodedPrivateKey.substring(0, 20)}...`, 'debug');
                
                // Timestamp ve nonce oluştur
                const timestamp = Math.floor(Date.now() / 1000);
                const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                
                log(`⏰ Timestamp: ${timestamp}`, 'debug');
                log(`🎲 Nonce: ${nonce}`, 'debug');
                
                // Data string oluştur (timestamp + nonce)
                const data = timestamp + nonce;
                log(`📝 Data: ${data}`, 'debug');
                
                // HMAC-SHA1 signature oluştur (encodedPrivateKey kullanarak)
                const encoder = new TextEncoder();
                const keyData = encoder.encode(encodedPrivateKey);
                const dataBuffer = encoder.encode(data);
                
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: 'SHA-1' },
                    false,
                    ['sign']
                );
                
                const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer);
                const signatureArray = Array.from(new Uint8Array(signatureBuffer));
                const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                log(`🔏 Signature: ${signature.substring(0, 20)}...`, 'debug');
                log(`📏 Signature Length: ${signature.length} karakter`, 'debug');
                
                // Expire süresi (55 dakika)
                const expireTime = timestamp + 3300;
                
                // Test için upload deneyelim
                const testContent = 'Manuel signature test - ' + new Date().toISOString();
                const testFile = new File([testContent], 'manual_test.txt', {
                    type: 'text/plain'
                });
                
                const formData = new FormData();
                formData.append('file', testFile);
                formData.append('fileName', 'manual_test.txt');
                formData.append('publicKey', MANUAL_PUBLIC_KEY);
                formData.append('signature', signature);
                formData.append('token', nonce);
                formData.append('expire', expireTime);
                
                log('🚀 Upload isteği gönderiliyor...', 'info');
                
                const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const resultText = await response.text();
                log(`📨 Response Status: ${response.status}`, response.ok ? 'success' : 'error');
                
                if (!response.ok) {
                    log(`❌ Hata Detayı: ${resultText}`, 'error');
                    
                    if (resultText.includes('invalid signature')) {
                        log('🔐 SIGNATURE HATASI: Oluşturulan signature geçersiz', 'error');
                    }
                } else {
                    const resultData = JSON.parse(resultText);
                    log('🎉 MANUEL SIGNATURE BAŞARILI!', 'success');
                    log(`📎 URL: ${resultData.url}`, 'info');
                    log(`🆔 File ID: ${resultData.fileId}`, 'info');
                }
                
            } catch (error) {
                log(`❌ Manuel signature hatası: ${error.message}`, 'error');
            } finally {
                setLoading(manualSigBtn, false);
            }
        }

        async function testAuth() {
            setLoading(authBtn, true);
            clearLog();
            
            try {
                log('🔑 Auth endpoint çağrılıyor...', 'info');
                
                const response = await fetch('https://adembayazit.netlify.app/.netlify/functions/imagekit-auth');
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                
                const data = await response.json();
                log('✅ Auth başarılı!', 'success');
                log(`🎫 Token: ${data.token.substring(0, 20)}...`, 'debug');
                log(`🔏 Signature: ${data.signature.substring(0, 20)}...`, 'debug');
                log(`📏 Signature Length: ${data.signature.length}`, 'debug');
                log(`⏰ Expire: ${data.expire}`, 'debug');
                log(`🔑 PublicKey: ${data.publicKey.substring(0, 20)}...`, 'debug');
                
                return data;
                
            } catch (error) {
                log(`❌ Auth hatası: ${error.message}`, 'error');
            } finally {
                setLoading(authBtn, false);
            }
        }

        async function testUpload() {
            setLoading(uploadBtn, true);
            
            try {
                log('📦 Upload testi başlıyor...', 'info');
                
                const authData = await testAuth();
                
                const testContent = 'ImageKit test - ' + new Date().toISOString();
                const testFile = new File([testContent], `test_${Date.now()}.txt`);
                
                const formData = new FormData();
                formData.append('file', testFile);
                formData.append('fileName', testFile.name);
                formData.append('publicKey', authData.publicKey);
                formData.append('signature', authData.signature);
                formData.append('token', authData.token);
                formData.append('expire', authData.expire);
                
                log('🚀 Upload isteği gönderiliyor...', 'info');
                
                const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const resultText = await response.text();
                log(`📨 Response: ${response.status}`, response.ok ? 'success' : 'error');
                
                if (!response.ok) {
                    log(`❌ Hata: ${resultText}`, 'error');
                } else {
                    const resultData = JSON.parse(resultText);
                    log('🎉 Upload başarılı!', 'success');
                    log(`📎 URL: ${resultData.url}`, 'info');
                }
                
            } catch (error) {
                log(`❌ Upload hatası: ${error.message}`, 'error');
            } finally {
                setLoading(uploadBtn, false);
            }
        }

        // Buton orijinal text'lerini kaydet
        window.addEventListener('load', () => {
            authBtn.setAttribute('data-original', authBtn.innerHTML);
            uploadBtn.setAttribute('data-original', uploadBtn.innerHTML);
            manualSigBtn.setAttribute('data-original', manualSigBtn.innerHTML);
            
            document.getElementById('testFile').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    fileInfo.innerHTML = `
                        <div class="status info">
                            ✅ Seçilen dosya: <strong>${file.name}</strong><br>
                            📦 Boyut: ${(file.size / 1024).toFixed(2)} KB<br>
                            🏷️ Tür: ${file.type || 'bilinmiyor'}
                        </div>
                    `;
                }
            });
            
            log('🟢 Test merkezi hazır!', 'success');
            if (MANUAL_PRIVATE_KEY) {
                log(`🔑 Private Key yüklendi: ${MANUAL_PRIVATE_KEY.substring(0, 15)}...`, 'info');
            } else {
                log('ℹ️ Lütfen yukarıdan Private Key girin', 'info');
            }
        });
    </script>
</body>
</html>
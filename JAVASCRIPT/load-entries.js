// 1. GLOBAL DEĞİŞKENLER
        const likesCache = {
          data: {},
          lastUpdated: 0,
          isUpdating: false
        };

        const pinsCache = {
          data: {},
          lastUpdated: 0,
          isUpdating: false
        };

        let allEntries = [];
        let groupedEntries = [];
        let displayedEntries = 0;
        const entriesPerPage = 20;
        let latestEntryId = null;
        let parentOfLatestId = null;

        // 2. PROXY HELPER FONKSİYONU
        async function fetchViaProxy(path, method = 'GET', body = null) {
          const proxyUrl = 'https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy';
          
          try {
            const response = await fetch(proxyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ path, method, body })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
          } catch (error) {
            console.error('Proxy error:', error);
            throw error;
          }
        }

        // 3. TEMEL FONKSİYONLAR
        async function loadInteractions() {
          try {
            const result = await fetchViaProxy('/b/68862fd97b4b8670d8a81945/latest');
            likesCache.data = result.likes || {};
            pinsCache.data = result.pins || {};
            likesCache.lastUpdated = pinsCache.lastUpdated = Date.now();
          } catch (error) {
            console.error('loadInteractions error:', error);
            try {
              const localLikes = localStorage.getItem('entryLikes') || '{}';
              const localPins = localStorage.getItem('entryPins') || '{}';
              likesCache.data = JSON.parse(localLikes);
              pinsCache.data = JSON.parse(localPins);
            } catch (parseError) {
              console.Error('Local storage parse error:', parseError);
            }
          }
        }

        // HTML içeriğini düzgün işlemek için yardımcı fonksiyon
        function formatContent(content) {
          content = content.replace(/<br\s*\/?>/gi, '<br>');
          content = content.replace(/<p>\s*<\/p>/gi, '');
          return content;
        }

        // ÇEVİRİ İKONLARINI EKLEME FONKSİYONU
        async function addTranslationIcons() {
          const entries = document.querySelectorAll(".entry");
          if (entries.length === 0) return;

          entries.forEach(entry => {
            const idDiv = entry.querySelector(".entry-id");
            const contentDiv = entry.querySelector(".content");
            const originalContent = contentDiv?.innerHTML?.trim();
            if (!idDiv || !originalContent) return;
            
            if (idDiv.querySelector(".translation-icon")) return;

            const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
            if (isNaN(idValue)) return;

            const translationEntry = allEntries.find(item => item.id === idValue);
            
            if (!translationEntry?.content_tr) return;

            const icon = document.createElement("span");
            icon.classList.add("translation-icon", "fi", "fi-tr");
            icon.title = "Çeviriyi göster/gizle";
            
            const langCode = translationEntry?.lang || 'tr';
            icon.classList.add(`fi-${langCode}`);

            icon.addEventListener("click", (e) => {
              e.stopPropagation();
              icon.classList.toggle("active");
              
              if (icon.classList.contains("active")) {
                if (translationEntry.content_tr) {
                  contentDiv.innerHTML = formatContent(translationEntry.content_tr);
                }
              } else {
                contentDiv.innerHTML = originalContent;
              }
            });

            document.addEventListener("click", (e) => {
              if (!icon.contains(e.target) && !contentDiv.contains(e.target)) {
                icon.classList.remove("active");
                contentDiv.innerHTML = originalContent;
              }
            });

            idDiv.appendChild(icon);
          });
        }

        function createEntryElement(entry, depth = 0) {
          const entryDiv = document.createElement("div");
          entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;
          
          if (entry.id === latestEntryId) {
            entryDiv.classList.add('latest-entry');
          }
          
          if (entry.id === parentOfLatestId) {
            entryDiv.classList.add('parent-of-latest');
          }
          
          if (depth > 0) {
            entryDiv.style.marginLeft = (depth * 30) + 'px';
          }

          const time = new Date(entry.date).toLocaleString("tr-TR", {
            year: "numeric", 
            month: "2-digit", 
            day: "2-digit", 
            hour: "2-digit", 
            minute: "2-digit"
          }).replace(",", "");

          const likeCount = likesCache.data[entry.id] || 0;
          const pinCount = pinsCache.data[entry.id] || 0;

          const formattedContent = formatContent(entry.content);

          entryDiv.innerHTML = `
            <div class="timestamp">
              <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
            </div>
            <div class="entry-id">#${entry.id}</div>
            <div class="content">${formattedContent}</div>
            <div class="interaction-buttons">
              <div class="daisy-like" data-entry-id="${entry.id}">
                <img src="/IMAGES/daisy.svg" class="daisy-icon" alt="Beğen" />
                <span class="like-count">${likeCount}</span>
              </div>
              <div class="pine-pin" data-entry-id="${entry.id}">
                <img src="/IMAGES/pine.svg" class="pine-icon" alt="Pinle" />
                <span class="pin-count">${pinCount}</span>
              </div>
            </div>
          `;

          const likeIcon = entryDiv.querySelector(".daisy-icon");
          likeIcon?.addEventListener("click", () => handleLikeClick(entry.id, entryDiv));

          const pinIcon = entryDiv.querySelector(".pine-icon");
          pinIcon?.addEventListener("click", () => handlePinClick(entry.id, entryDiv));

          return entryDiv;
        }

        // Entry'leri gruplama fonksiyonu
        function groupEntries(entries) {
          const parentMap = new Map();
          const childMap = new Map();
          const parentEntries = [];
          
          // Önce tüm entry'leri parent ve child olarak ayır
          entries.forEach(entry => {
            if (!entry.references || entry.references.length === 0) {
              parentEntries.push(entry);
            } else {
              const parentId = entry.references[0];
              if (!childMap.has(parentId)) {
                childMap.set(parentId, []);
              }
              childMap.get(parentId).push(entry);
            }
          });
          
          // Parent entry'leri tarihe göre sırala (yeniden eskiye)
          parentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          // Parent entry'leri grupla ve child'larını ekle
          const groups = [];
          parentEntries.forEach(parent => {
            const children = childMap.get(parent.id) || [];
            
            // Child'ları tarihe göre sırala (yeniden eskiye)
            children.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Grubun tarihini belirle (en yeni tarih - parent veya child'lardan)
            const groupDate = children.length > 0 
              ? new Date(Math.max(new Date(parent.date), ...children.map(c => new Date(c.date))))
              : new Date(parent.date);
            
            groups.push({
              parent,
              children,
              groupDate
            });
          });
          
          // Grupları grup tarihine göre sırala (yeniden eskiye)
          groups.sort((a, b) => b.groupDate - a.groupDate);
          
          return groups;
        }

        function displayEntries(startIndex, count) {
          const container = document.getElementById("entries");
          const loadingElement = document.getElementById("loading");
          const loadMoreBtn = document.getElementById("loadMoreBtn");
          
          if (startIndex >= groupedEntries.length) {
            loadMoreBtn.style.display = 'none';
            return;
          }
          
          loadingElement.style.display = 'block';
          
          // Yeni grupları ekle
          const endIndex = Math.min(startIndex + count, groupedEntries.length);
          for (let i = startIndex; i < endIndex; i++) {
            const group = groupedEntries[i];
            
            // Grup container'ı oluştur
            const groupDiv = document.createElement("div");
            groupDiv.className = "entry-group";
            
            // Parent entry'yi ekle
            const parentElement = createEntryElement(group.parent, 0);
            groupDiv.appendChild(parentElement);
            
            // Child entry'leri ekle
            group.children.forEach(child => {
              const childElement = createEntryElement(child, 1);
              groupDiv.appendChild(childElement);
            });
            
            container.appendChild(groupDiv);
          }
          
          displayedEntries = endIndex;
          document.getElementById('entryCount').textContent = `Total ${allEntries.length} entries loaded`;
          
          // Çeviri ikonlarını ekle
          addTranslationIcons();
          
          loadingElement.style.display = 'none';
          
          if (displayedEntries >= groupedEntries.length) {
            loadMoreBtn.style.display = 'none';
          }
        }

        // 4. INTERACTION FONKSİYONLARI
        async function handleLikeClick(entryId, entryDiv) {
          if (likesCache.isUpdating) return;

          likesCache.isUpdating = true;
          const likeCountSpan = entryDiv.querySelector(".like-count");
          const likeIcon = entryDiv.querySelector(".daisy-icon");
          const currentCount = parseInt(likeCountSpan.textContent) || 0;

          try {
            likeCountSpan.textContent = currentCount + 1;
            likeIcon.style.transform = 'scale(1.2)';
            
            likesCache.data[entryId] = currentCount + 1;
            localStorage.setItem('entryLikes', JSON.stringify(likesCache.data));
            
            await updateInteractionsOnServer(entryId, currentCount + 1, null);
            likesCache.lastUpdated = Date.now();
          } catch (error) {
            console.error('Like update failed:', error);
            likeCountSpan.textContent = currentCount;
            likesCache.data[entryId] = currentCount;
          } finally {
            likesCache.isUpdating = false;
            setTimeout(() => {
              likeIcon.style.transform = 'scale(1)';
            }, 300);
          }
        }

        async function handlePinClick(entryId, entryDiv) {
          if (pinsCache.isUpdating) return;

          pinsCache.isUpdating = true;
          const pinCountSpan = entryDiv.querySelector(".pin-count");
          const pinIcon = entryDiv.querySelector(".pine-icon");
          const currentCount = parseInt(pinCountSpan.textContent) || 0;

          try {
            pinCountSpan.textContent = currentCount + 1;
            pinIcon.classList.add("pinned");
            
            pinsCache.data[entryId] = currentCount + 1;
            localStorage.setItem('entryPins', JSON.stringify(pinsCache.data));
            
            await updateInteractionsOnServer(entryId, null, currentCount + 1);
            pinsCache.lastUpdated = Date.now();
          } catch (error) {
            console.error('Pin update failed:', error);
            pinCountSpan.textContent = currentCount;
            pinsCache.data[entryId] = currentCount;
          } finally {
            pinsCache.isUpdating = false;
            setTimeout(() => {
              pinIcon.classList.remove("pinned");
            }, 600);
          }
        }

        async function updateInteractionsOnServer(entryId, newLikeCount, newPinCount) {
          const updatedLikes = newLikeCount !== null ? { ...likesCache.data, [entryId]: newLikeCount } : likesCache.data;
          const updatedPins = newPinCount !== null ? { ...pinsCache.data, [entryId]: newPinCount } : pinsCache.data;

          try {
            await fetchViaProxy('/b/68862fd97b4b8670d8a81945', 'PUT', {
              likes: updatedLikes,
              pins: updatedPins
            });
          } catch (error) {
            throw new Error('Failed to update data on server');
          }
        }

        // 5. BAŞLANGIÇ FONKSİYONU
        async function initializeApp() {
          try {
            await loadInteractions();
            const entriesData = await fetchViaProxy('/b/68933248ae596e708fc2fbbc/latest');
            allEntries = entriesData.records || entriesData;
            
            // Tüm entry'leri tarihe göre yeniden eskiye sırala
            allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // En son eklenen entry'nin ID'sini bul
            if (allEntries.length > 0) {
              latestEntryId = allEntries[0].id;
              
              // En son eklenen entry'nin parent'ını bul
              const latestEntry = allEntries.find(entry => entry.id === latestEntryId);
              if (latestEntry && latestEntry.references && latestEntry.references.length > 0) {
                parentOfLatestId = latestEntry.references[0];
              }
            }
            
            // Entry'leri grupla
            groupedEntries = groupEntries(allEntries);
            
            // İlk 20 grubu göster
            displayEntries(0, entriesPerPage);
            
            // Daha fazla yükle butonuna event listener ekle
            document.getElementById('loadMoreBtn').addEventListener('click', () => {
              displayEntries(displayedEntries, entriesPerPage);
            });
          } catch (error) {
            console.error("Initialization error:", error);
            try {
              const response = await fetch("entries.json");
              const entriesData = await response.json();
              allEntries = entriesData.records || entriesData;
              
              allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
              
              if (allEntries.length > 0) {
                latestEntryId = allEntries[0].id;
                
                const latestEntry = allEntries.find(entry => entry.id === latestEntryId);
                if (latestEntry && latestEntry.references && latestEntry.references.length > 0) {
                  parentOfLatestId = latestEntry.references[0];
                }
              }
              
              groupedEntries = groupEntries(allEntries);
              
              displayEntries(0, entriesPerPage);
              
              document.getElementById('loadMoreBtn').addEventListener('click', () => {
                displayEntries(displayedEntries, entriesPerPage);
              });
            } catch (fallbackError) {
              console.error("Fallback failed:", fallbackError);
              document.getElementById("entries").innerHTML = 
                '<div class="error">Veriler yüklenirken bir hata oluştu</div>';
            }
          }
        }

        // 6. UYGULAMAYI BAŞLAT
        document.addEventListener("DOMContentLoaded", initializeApp);
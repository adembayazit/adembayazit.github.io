document.addEventListener("DOMContentLoaded", () => {
  fetch("entries.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("entries");
      container.innerHTML = '';

      // En son entry ve onun zincirini bul
      const latestEntry = data.reduce((latest, entry) => 
        new Date(entry.date) > new Date(latest.date) ? entry : latest
      );

      const threadEntries = new Set();
      const depthMap = new Map();
      
      const findThread = (id, depth = 0) => {
        const entry = data.find(e => e.id === id);
        if (entry && !threadEntries.has(entry.id)) {
          threadEntries.add(entry.id);
          depthMap.set(entry.id, depth);
          
          let maxDepth = depth;
          entry.references.forEach(refId => {
            const childDepth = findThread(refId, depth + 1);
            if (childDepth > maxDepth) maxDepth = childDepth;
          });
          return maxDepth;
        }
        return depth;
      };
      
      findThread(latestEntry.id);

      // Sıralama: Önce thread, sonra diğerleri (yeni tarih üstte)
      const sortedEntries = data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      const threadGroup = sortedEntries.filter(e => threadEntries.has(e.id));
      const otherEntries = sortedEntries.filter(e => !threadEntries.has(e.id));
      const finalEntries = [...threadGroup, ...otherEntries];

      // Entry'leri oluştur
      finalEntries.forEach((entry) => {
        const entryDiv = document.createElement("div");
        entryDiv.className = "entry";
        const depth = depthMap.get(entry.id) || 0;
        
        if (threadEntries.has(entry.id)) {
          entryDiv.classList.add("thread-entry");
          // Derinliğe göre girinti ekle
          const indent = depth * 20; // Daha küçük girinti
          entryDiv.style.marginLeft = `${indent}px`;
        }
        
        entryDiv.dataset.id = entry.id;

        const time = new Date(entry.date).toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }).replace(",", "");

        entryDiv.innerHTML = `
          <div class="entry-header">
            <div class="timestamp">📅 ${time}</div>
            <div class="entry-id">#${entry.id}</div>
          </div>
          <div class="content">${entry.content}</div>
        `;
        
        container.appendChild(entryDiv);
      });

      // İlişki ağını çiz
      drawConnections(data);
    });
});

function drawConnections(entries) {
  const entryElements = document.querySelectorAll('.entry');
  const container = document.getElementById('entries');
  
  // Eski canvas'ı temizle
  const oldCanvas = document.getElementById('connections-canvas');
  if (oldCanvas) oldCanvas.remove();
  
  // Yeni canvas oluştur
  const canvas = document.createElement('canvas');
  canvas.id = 'connections-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  container.prepend(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Canvas boyutunu ayarla
  function resizeCanvas() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    draw();
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Bağlantıları çiz
    ctx.strokeStyle = 'rgba(50, 205, 50, 0.7)';
    ctx.lineWidth = 3; // Daha kalın çizgiler
    ctx.setLineDash([5, 3]);

    entries.forEach(entry => {
      if (entry.references.length > 0) {
        const sourceElem = document.querySelector(`.entry[data-id="${entry.id}"]`);
        if (!sourceElem) return;
        
        const sourceRect = sourceElem.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Kaynak noktası: sol kenar orta noktası
        const sourceX = sourceRect.left - containerRect.left;
        const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
        
        entry.references.forEach(refId => {
          const targetElem = document.querySelector(`.entry[data-id="${refId}"]`);
          if (targetElem) {
            const targetRect = targetElem.getBoundingClientRect();
            
            // Hedef noktası: sol kenar orta noktası
            const targetX = targetRect.left - containerRect.left;
            const targetY = targetRect.top - containerRect.top + targetRect.height / 2;
            
            // Ok çizimi
            ctx.beginPath();
            ctx.moveTo(sourceX, sourceY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            
            // Ok başı
            const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
            drawArrowhead(ctx, targetX, targetY, angle);
          }
        });
      }
    });
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function drawArrowhead(ctx, x, y, angle) {
  const size = 12;
  ctx.fillStyle = 'rgba(50, 205, 50, 0.9)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - size * Math.cos(angle - Math.PI / 6),
    y - size * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x - size * Math.cos(angle + Math.PI / 6),
    y - size * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

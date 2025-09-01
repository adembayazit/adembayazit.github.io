// sw.js
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || 'https://adembayazit.com/IMAGES/ab.png',
    badge: 'https://adembayazit.com/IMAGES/ab.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || 'https://adembayazit.com/microblog'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Yeni LadyBuG Entry!', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
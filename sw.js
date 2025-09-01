// Basit bir Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/IMAGES/ab.png',
    badge: '/IMAGES/ab.png',
    vibrate: [200, 100, 200],
    tag: 'new-entry'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('https://adembayazit.com/microblog.html')
  );
});

self.addEventListener('message', event => {
  if (event.data.type === 'NEW_ENTRY') {
    const entry = event.data.entry;
    const title = 'Yeni LadyBuG Entry!';
    const body = entry.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
    
    self.registration.showNotification(title, {
      body: body,
      icon: '/IMAGES/ab.png',
      badge: '/IMAGES/ab.png',
      tag: 'new-entry'
    });
  }
});

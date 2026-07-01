/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Service Worker for SEPAC Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'SEPAC Update', body: 'New community content is available!', url: '/' };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'SEPAC Update', body: event.data.text(), url: '/' };
    }
  }

  const options = {
    body: payload.body,
    icon: '/assets/sepac_logo.png',
    badge: '/assets/sepac_logo.png',
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        client.postMessage({ action: 'navigate', url: event.notification.data.url });
        return client.focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});

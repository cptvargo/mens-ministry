// Service Worker for Push Notifications
// This runs in the background even when the app is closed

self.addEventListener('install', (event) => {
  console.log('Service Worker installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
  event.waitUntil(self.clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'New Message',
        body: event.data.text()
      }
    }
  }

  const title = data.title || 'Men\'s Ministry Connect'
  const options = {
    body: data.body || 'You have a new message',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ],
    requireInteraction: false,
    tag: data.tag || 'message-notification'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open the app
        if (self.clients.openWindow) {
          return self.clients.openWindow('/')
        }
      })
  )
})

// Sync messages when online
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event)
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})

async function syncMessages() {
  // This would sync with a server if you had one
  // For now, just a placeholder
  console.log('Syncing messages...')
}

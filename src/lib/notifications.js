// Notification utilities

// Request permission for notifications
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (!('serviceWorker' in navigator)) {
    console.log('This browser does not support service workers')
    return false
  }

  // Check current permission
  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission was denied')
    return false
  }

  // Request permission
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    console.log('Service Worker registered:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

// Show a local notification (when app is open or in background)
export async function showNotification(title, options = {}) {
  const hasPermission = await requestNotificationPermission()
  
  if (!hasPermission) {
    console.log('No notification permission')
    return false
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready

  // Show notification through service worker
  await registration.showNotification(title, {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    ...options
  })

  return true
}

// Initialize notifications for the app
export async function initializeNotifications() {
  // Register service worker
  const registration = await registerServiceWorker()
  
  if (!registration) {
    return false
  }

  // Request permission
  const hasPermission = await requestNotificationPermission()
  
  return hasPermission
}

// Send notification about new message
export async function notifyNewMessage(userName, message, roomName) {
  await showNotification(`${userName} in ${roomName}`, {
    body: message.length > 100 ? message.substring(0, 100) + '...' : message,
    tag: 'new-message',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  })
}

// Send notification about new event
export async function notifyNewEvent(eventTitle, eventDate) {
  await showNotification('New Event Posted', {
    body: `${eventTitle} - ${eventDate}`,
    tag: 'new-event',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  })
}

// Check if notifications are enabled
export function areNotificationsEnabled() {
  return Notification.permission === 'granted'
}

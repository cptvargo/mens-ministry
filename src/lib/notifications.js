// ============================================
// Notification utilities (Local + Remote Push)
// ============================================

// 🔐 Replace with your PUBLIC VAPID key
const VAPID_PUBLIC_KEY = "BEjx7S8bTYBqqAtzFc2DwT_NfiF43XAXA3vxQTwJsz5e9n7bE81BmrLnKFYyQ-P8omXoc0O5SdUNzMFMlNelDBA"

// Convert VAPID key for pushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

// ============================================
// Request permission for notifications
// ============================================

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (!('serviceWorker' in navigator)) {
    console.log('This browser does not support service workers')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission was denied')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// ============================================
// Register service worker
// ============================================

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

// ============================================
// Subscribe to Remote Push (NEW)
// ============================================

export async function subscribeToPush() {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return null

  const registration = await navigator.serviceWorker.ready

  // Prevent duplicate subscriptions
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    return existing
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })

  return subscription
}

// Optional: Unsubscribe
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await subscription.unsubscribe()
  }
}

// ============================================
// Show a local notification
// ============================================

export async function showNotification(title, options = {}) {
  const hasPermission = await requestNotificationPermission()
  
  if (!hasPermission) {
    console.log('No notification permission')
    return false
  }

  const registration = await navigator.serviceWorker.ready

  await registration.showNotification(title, {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    ...options
  })

  return true
}

// ============================================
// Initialize notifications for the app
// ============================================

export async function initializeNotifications() {
  const registration = await registerServiceWorker()
  if (!registration) return false

  const hasPermission = await requestNotificationPermission()
  return hasPermission
}

// ============================================
// Enable Remote Push (NEW)
// Call this from a button click
// ============================================

export async function enableRemotePush(sendToServer) {
  const registration = await registerServiceWorker()
  if (!registration) return false

  const subscription = await subscribeToPush()
  if (!subscription) return false

  // Send subscription to backend (Supabase)
  if (sendToServer && typeof sendToServer === 'function') {
    await sendToServer(subscription)
  }

  return true
}

// ============================================
// Existing local notification helpers (UNCHANGED)
// ============================================

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

// ============================================
// Check if notifications are enabled
// ============================================

export function areNotificationsEnabled() {
  return Notification.permission === 'granted'
}

// ============================================
// Push Notification Utilities (Remote + Local)
// ============================================

// 🔐 Replace with your PUBLIC VAPID key
const VAPID_PUBLIC_KEY = "YOUR_PUBLIC_VAPID_KEY_HERE"

// Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

// ============================================
// Permission
// ============================================

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (!('serviceWorker' in navigator)) return false

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// ============================================
// Service Worker
// ============================================

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    return registration
  } catch (error) {
    console.error('SW registration failed:', error)
    return null
  }
}

// ============================================
// Push Subscription (REMOTE PUSH)
// ============================================

export async function subscribeToPush() {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return null

  const registration = await navigator.serviceWorker.ready

  // Check existing subscription
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    return existing
  }

  // Create new subscription
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })

  return subscription
}

// Optional: Unsubscribe user
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await subscription.unsubscribe()
  }
}

// ============================================
// Local Notifications (App-triggered)
// ============================================

export async function showNotification(title, options = {}) {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return false

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
// Initialize (Call on Button Click)
// ============================================

export async function enablePushNotifications(sendToServer) {
  // sendToServer(subscription) should save to Supabase

  const registration = await registerServiceWorker()
  if (!registration) return false

  const subscription = await subscribeToPush()
  if (!subscription) return false

  if (sendToServer && typeof sendToServer === 'function') {
    await sendToServer(subscription)
  }

  return true
}

// ============================================
// Helpers
// ============================================

export function areNotificationsEnabled() {
  return Notification.permission === 'granted'
}

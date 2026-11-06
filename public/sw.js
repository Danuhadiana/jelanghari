// Jelang Hari POS Service Worker for PWA Support
const CACHE_NAME = 'jh-pos-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy with cache fallback for offline resilience
self.addEventListener('fetch', (event) => {
  // Only handle GET requests, leave POST/PUT/DELETE untouched for CSRF and mutations
  if (event.request.method !== 'GET') {
    return;
  }

  // Bypass chrome extensions or external schemas
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to root if navigating
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

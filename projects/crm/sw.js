const CACHE_NAME = 'property-pro-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './css/styles.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/forms.css',
  './css/modals.css',
  './css/pages.css',
  './css/responsive.css',
  './js/core/utils.js',
  './js/core/storage.js',
  './js/core/state.js',
  './js/ui/modal.js',
  './js/ui/navigation.js',
  './js/properties/property-share.js',
  './js/properties/properties.js',
  './js/projects/projects.js',
  './js/features/dashboard.js',
  './js/features/favorites.js',
  './js/features/followups.js',
  './js/features/search.js',
  './js/features/history.js',
  './js/features/settings.js',
  './js/features/profile.js',
  './js/features/backup.js',
  './js/app.js',
  './manifest.json',
  './icon.png',
  './card.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle local same-origin assets
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  } else {
    // For external assets (CDN like xlsx)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});

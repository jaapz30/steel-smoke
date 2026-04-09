// ── SERVICE WORKER v5 — Steel & Smoke ────────────────────────
// Bump CACHE_VERSION om nieuwe versie af te dwingen
const CACHE_VERSION = 'v11-20260409-1800';
const CACHE_NAME = 'steel-smoke-' + CACHE_VERSION;

const STATIC_ASSETS = [
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// INSTALL — cache alle assets
self.addEventListener('install', e => {
  console.log('[SW] Installing', CACHE_NAME);
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn('[SW] Cache fail:', url, err))))
    )
  );
  // Activeer meteen zonder wachten op clients die sluiten
  self.skipWaiting();
});

// ACTIVATE — verwijder ALLE oude caches
self.addEventListener('activate', e => {
  console.log('[SW] Activating', CACHE_NAME);
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
    })
  );
  // Neem direct controle over alle open tabs
  self.clients.claim();
});

// FETCH — Network First voor HTML (altijd verse versie), Cache First voor rest
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Network-first voor HTML en JS — nooit de cache tonen bij update
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('app.js')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first voor alle andere assets (CSS, PNG, fonts)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});

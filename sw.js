// ── SERVICE WORKER v6 — Steel & Smoke ────────────────────────
// KRITISCH: versie bumpen bij elke deploy om cache te forceren
const CACHE_VERSION = 'v12-20260410-1800';
const CACHE_NAME = 'steel-smoke-' + CACHE_VERSION;

// Absolute paden — moeten exact overeenkomen met manifest start_url
const STATIC_ASSETS = [
  '/steel-smoke/index.html',
  '/steel-smoke/app.js',
  '/steel-smoke/style.css',
  '/steel-smoke/manifest.json',
  '/steel-smoke/icons/icon-192.png',
  '/steel-smoke/icons/icon-512.png',
];

// INSTALL — pre-cache alle kritieke assets
self.addEventListener('install', e => {
  console.log('[SW v6] Installing', CACHE_NAME);
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Cache fail:', url, err))
        )
      )
    ).then(() => {
      console.log('[SW v6] All assets cached');
      return self.skipWaiting(); // activeer direct, wacht niet op tab-sluit
    })
  );
});

// ACTIVATE — verwijder ALLE caches behalve huidige versie
self.addEventListener('activate', e => {
  console.log('[SW v6] Activating, claiming clients');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW v6] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim()) // neem direct controle
  );
});

// FETCH — Stale-While-Revalidate voor HTML/JS, Cache-First voor assets
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Sla externe requests over (Leaflet CDN, OpenStreetMap tiles)
  if (!url.origin.includes('github.io') && !url.hostname.includes('localhost')) {
    // Laat externe requests gewoon door
    return;
  }

  // STRATEGIE: Stale-While-Revalidate voor HTML en JS
  // → Toont direct cached versie, update op achtergrond
  // → Geen verouderde cache bij volgende open
  if (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('app.js') ||
    url.pathname === '/steel-smoke/' ||
    url.pathname === '/steel-smoke'
  ) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const networkFetch = fetch(e.request).then(response => {
            if (response && response.status === 200) {
              cache.put(e.request, response.clone());
            }
            return response;
          }).catch(() => cached); // offline fallback

          // Geef cache direct terug maar update op achtergrond
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Cache-First voor CSS, afbeeldingen, fonts
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return response;
      }).catch(() => caches.match('/steel-smoke/index.html'));
    })
  );
});

// Notificatie klik → open app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Als app al open is, focus die
      for (const client of clientList) {
        if (client.url.includes('/steel-smoke') && 'focus' in client) {
          return client.focus();
        }
      }
      // Anders open nieuw venster
      return clients.openWindow('/steel-smoke/');
    })
  );
});

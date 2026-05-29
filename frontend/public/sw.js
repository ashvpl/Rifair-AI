/**
 * Rifair AI — High-Performance Offline & Performance Optimization Service Worker
 *
 * Implements Stale-While-Revalidate and Cache-First caching strategies for static resources
 * (fonts, JS, CSS, images) and Network-First caching for documents.
 * Explicitly bypasses dynamic API routes, Clerk auth, and non-GET requests.
 */

const CACHE_NAME = 'rifair-v1';
const STATIC_ASSETS = [
  '/',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/rifair-logo.png',
];

// 1. Install Event: Cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app shell assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Smart interception and caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass criteria:
  // - Non-GET requests (POST, PUT, DELETE, etc. cannot be cached)
  // - Dynamic backend API queries
  // - SSO callback navigation
  // - Clerk Authentication hostnames/endpoints
  // - NextJS live-reloading or hot-module replacement in development
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/sso-callback') ||
    url.hostname.includes('clerk') ||
    url.pathname.includes('/_next/webpack-hmr')
  ) {
    return;
  }

  // Strategy A: Cache First + Background Sync (Stale-While-Revalidate) for Static Assets
  // This targets scripts, stylesheets, custom local fonts, and public image assets.
  const isStaticResource =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg');

  if (isStaticResource) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve immediately from cache, fetch updated version in background to refresh the cache
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {
              /* Keep using cache if offline */
            });
          return cachedResponse;
        }

        // Cache miss: retrieve from network and cache it
        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Strategy B: Network First for standard Page Navigations / HTML Documents
  // Ensures standard content is always fresh, with seamless offline cache fallback.
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache valid page navigations
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline / poor network fallback: retrieve cached document matching this page
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Optional: Return a generic offline page if request.mode === 'navigate' and not in cache
        });
      })
  );
});

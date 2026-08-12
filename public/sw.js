const CACHE_NAME = 'aurevia-cache-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  OFFLINE_URL,
  '/icon.svg',
  '/favicon.ico'
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
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Bypass cache for private, dynamic or api routes
  const bypassRoutes = [
    '/admin',
    '/dashboard',
    '/auth',
    '/api',
    '/booking',
    '/forgot-password',
    '/reset-password',
    '/login',
    '/register'
  ];

  const shouldBypass = bypassRoutes.some(route => url.pathname.startsWith(route)) || 
                       url.pathname.includes('/_next/') || 
                       url.hostname.includes('supabase.co') ||
                       url.hostname.includes('razorpay.com');

  if (shouldBypass) {
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache safe static pages & assets
        if (response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is an HTML page, serve the offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Listener for skipWaiting request from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

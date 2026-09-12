// sw.js - Basic Service Worker to make the app installable
const CACHE_NAME = 'gpsnt-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './src/main.js',
  './src/styles/main.css',
  './src/styles/theme.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

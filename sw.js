// Part 107 Exam Guide - Service Worker
// Provides offline support via cache-first for static assets and network-first for HTML.

const CACHE_NAME = 'part107-v1';

// Core app shell — pre-cached on install so the app works offline.
const CORE_ASSETS = [
  '/index.html',
  '/flashcards.html',
  '/practice-exam.html',
  '/reference.html',
  '/dashboard.html',
  '/tools/metar-decoder.html',
  '/tools/chart-quiz.html',
  '/chapters/regulations.html',
  '/chapters/airspace.html',
  '/chapters/weather.html',
  '/chapters/loading-performance.html',
  '/chapters/operations.html',
  '/css/styles.css',
  '/js/assistant.js',
  '/js/chart-quiz.js',
  '/js/dashboard.js',
  '/js/metar-decoder.js',
  '/js/nav.js',
  '/js/progress.js',
  '/js/quiz-engine.js',
  '/js/slides.js',
  '/manifest.json'
];

// Install: pre-cache the app shell, then activate immediately.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(CORE_ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// Activate: clean up old caches and take control of open clients.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for HTML (so fresh content wins when online),
// cache-first for everything else (CSS/JS/images/etc.).
self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Only handle GET requests.
  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  // Skip cross-origin requests.
  if (url.origin !== self.location.origin) return;

  var acceptsHTML = request.headers.get('accept') && request.headers.get('accept').indexOf('text/html') !== -1;
  var isHTML = request.mode === 'navigate' || acceptsHTML || url.pathname.endsWith('.html');

  if (isHTML) {
    // Network-first strategy for HTML pages.
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Cache a copy of the fresh response for offline use.
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          // Network failed — fall back to cache, then to /index.html.
          return caches.match(request).then(function (cached) {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (CSS, JS, images, etc.).
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        // Cache successful same-origin responses for next time.
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});

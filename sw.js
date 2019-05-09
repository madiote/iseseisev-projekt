/* jshint esversion:6 */

let CACHE_NAME = 'site-cache';
let urlsToCache = [
  '.',
  'offline.manifest',
  'favicon.png',
  'index.html',
  'index.js',
  'index.css',
  'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.5.0/velocity.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/muuri/0.4.0/muuri.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'
];

self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function (cache) {
      console.log('Using content from SW cache');
      //console.log(urlsToCache);
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
    .then(function (response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
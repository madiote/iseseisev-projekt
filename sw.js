/* jshint esversion:6 */

self.addEventListener('fetch', function(event) {
    console.log(event.request);

    event.respondWith(
        caches.match(event.request).then(function(response) {
          return response || event.default();
        })
    );
});

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('static-v1').then(function(cache) {
        return cache.addAll([
          '/'
        ]);
      })
    );
  });
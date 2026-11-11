// sw.js
const CACHE_NAME = 'youkaen-tools-v6';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './tool1.html',
  './tool2.html',
  './tool3.html',
  './tool4.html',
  './tool5.html',
  './tool6.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // ブラウザの古い一時キャッシュを無視して最新を取得
      const requests = ASSETS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' }));
      return cache.addAll(requests);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ネット優先（Network First）：オンライン時は常に最新を取得し、圏外時のみキャッシュを返す
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

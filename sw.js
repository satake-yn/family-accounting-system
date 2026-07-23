const CACHE_NAME = 'kakeibo-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール時に静的ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 有効化
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// リクエスト時のキャッシュ制御
self.addEventListener('fetch', (event) => {
  // GAS（API）への通信はキャッシュせず、常に最新のネットワーク通信を行う
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // 静的ファイルはキャッシュを優先して高速起動
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

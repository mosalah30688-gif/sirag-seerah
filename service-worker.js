const CACHE = 'sirag-v1.15-images-17';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './seal.png',
  './icon-512.png',
  './icon.png',
  './data/seerah.json',
  './data/ayahs.json',
  './data/hadith.json',
  './data/maps.json',
  './data/nasab.json'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u=>c.add(u).catch(()=>{})))).then(()=> self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=> self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // only GET
  if(req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if(cached) {
        // update in background
        e.waitUntil(fetch(req).then(res=>{
          if(res.ok) caches.open(CACHE).then(c=>c.put(req,res));
        }).catch(()=>{}));
        return cached;
      }
      return fetch(req).then(res=>{
        if(res.ok && req.url.includes('/sirag-seerah/')){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(req,clone));
        }
        return res;
      }).catch(()=> cached || caches.match('./index.html'));
    })
  );
});

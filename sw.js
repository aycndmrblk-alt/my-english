const CACHE_NAME='my-english-v8';
const APP_FILES=['./','./index.html','./styles.css','./firebase-config.js?v=1','./app.js?v=7','./firebase-sync.js?v=1','./manifest.webmanifest','./icons/app-icon-192.svg','./icons/app-icon-512.svg','./icons/apple-touch-icon.png','./icons/app-icon-192.png','./icons/app-icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
    return response;
  }).catch(()=>caches.match('./index.html'))));
});

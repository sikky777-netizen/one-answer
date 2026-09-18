const CACHE="one-answer-v21-stable";
const ASSETS=["./","./index.html","./share.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./install-icon-v13-192.png","./install-icon-v13-512.png","./dubu-avatar.jpg","./og-image.jpg","./taxi-ad.webp"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{let c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))))});

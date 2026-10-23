/* Finans Robotu — çevrimdışı çalışma (service worker). Yalnızca uygulama dosyalarını önbelleğe alır; kişisel veri tarayıcının
   yerel deposunda (localStorage / IndexedDB) kalır ve buraya hiç girmez. Yeni sürüm yüklendiğinde arka planda güncellenir. */
const CACHE = "finans-robotu-v18";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./ikon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())) });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
/* Önce önbellek (çevrimdışı açılış), arka planda ağdan tazele. Başka sitelere (ör. döviz kuru) giden istekler önbelleğe alınmaz. */
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r }).catch(() => hit);
    return hit || net;
  })));
});

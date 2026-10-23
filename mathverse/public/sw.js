/* MathVerse: service worker para usar la app sin conexión después de la primera visita. */
// la lista de archivos y la versión las completa el build (vite.config.ts)
const ASSETS = self.__MV_ASSETS__ || []
const CACHE = 'mathverse-' + (self.__MV_VERSION__ || 'dev')

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './favicon.svg', './manifest.webmanifest', ...ASSETS])).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  if (req.mode === 'navigate') {
    // páginas: primero la red (para recibir actualizaciones), si no hay conexión, la copia guardada
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res }).catch(() => caches.match('./index.html')))
    return
  }
  // recursos con nombre versionado (js, css, fuentes de KaTeX): primero la copia guardada
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) } return res })))
})

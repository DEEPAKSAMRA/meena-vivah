// मीना समाज वैवाहिक — Service Worker
const CACHE = "meena-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap"
];

// Install — cache core assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener("fetch", e => {
  // Skip non-GET and cross-origin API calls
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("script.google.com")) return;
  if (e.request.url.includes("allorigins") || e.request.url.includes("corsproxy")) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Cache successful responses
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});

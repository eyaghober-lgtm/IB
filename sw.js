/* Service worker: makes the site installable and usable offline.
   Network first (so updates always show when online), cached copy when offline. */
const V = "ib-v1";
const CORE = ["./", "index.html", "form.html", "log.html", "setup.html", "manifest.webmanifest",
  "assets/style.css", "assets/common.js", "assets/form.js", "assets/log.js", "assets/pwa.js",
  "assets/logo.png", "assets/logo-white.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const url = new URL(r.url);
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r).then((hit) => hit || (r.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});

/*
 * ROMÊNIA 2026 — Service Worker
 *
 * Estratégia:
 *  - HTML e data/itinerary.js  -> REDE PRIMEIRO (com cache de reserva).
 *    Assim, alterações de roteiro, hotéis e reservas aparecem assim que o
 *    aparelho estiver online, sem ficarem presas num cache antigo.
 *  - Demais arquivos (CSS, JS, ícones) -> CACHE PRIMEIRO, com atualização
 *    silenciosa em segundo plano.
 *  - Requisições para outros domínios (Google Maps, tel:) passam direto.
 *
 * ATUALIZAÇÃO: ao publicar conteúdo novo no GitHub, altere CACHE_VERSION
 * abaixo (ex.: v3 -> v4). Isso descarta o cache antigo e faz o app mostrar
 * o aviso "Roteiro atualizado" para o usuário.
 */

const CACHE_VERSION = "romenia-2026-v2";

const APP_SHELL = [
  ".",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/maps.js",
  "js/map-romania.js",
  "data/itinerary.js",
  "manifest.webmanifest",
  "assets/icons/icon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(
        chaves.filter((c) => c !== CACHE_VERSION).map((c) => caches.delete(c))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const ehConteudo =
    req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("index.html") ||
    url.pathname.endsWith("data/itinerary.js");

  if (ehConteudo) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copia));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cacheado) => {
      const daRede = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copia = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => cacheado);
      return cacheado || daRede;
    })
  );
});

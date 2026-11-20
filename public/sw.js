/*
 * Service worker – EDM République Villeurbanne
 *
 * Volontairement simple :
 *  - pages publiques : réseau d'abord, copie locale si pas de connexion, sinon /hors-ligne.html ;
 *  - fichiers de l'appli (/_next/static, logos, icônes) : copie locale (ils ne changent jamais de contenu) ;
 *  - JAMAIS mis en cache : /admin, /api, les données Supabase, les PDF, YouTube.
 * Aucun accès hors ligne n'est promis pour les vidéos ou les PDF non téléchargés.
 */
const VERSION = 'v5';
const CACHE_STATIQUE = `edm-statique-${VERSION}`;
const CACHE_PAGES = `edm-pages-${VERSION}`;
const A_L_AVANCE = [
  '/hors-ligne.html',
  '/assets/logo-lockup.png',
  '/assets/logo-mark.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIQUE)
      .then((c) => c.addAll(A_L_AVANCE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c.startsWith('edm-') && ![CACHE_STATIQUE, CACHE_PAGES].includes(c)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

const estPrivee = (url) => url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, PDF, YouTube : jamais interceptés
  if (estPrivee(url)) return;

  // Fichiers immuables de l'appli
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      caches.open(CACHE_STATIQUE).then(async (cache) => {
        const trouve = await cache.match(req);
        if (trouve) return trouve;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Pages publiques
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok && res.type === 'basic') {
            const cache = await caches.open(CACHE_PAGES);
            cache.put(req, res.clone());
            limiter(cache, 30);
          }
          return res;
        } catch {
          const copie = await caches.match(req);
          if (copie) return copie;
          // Page jamais consultée : page autonome, sans JavaScript de l'application
          return (await caches.match('/hors-ligne.html')) || Response.error();
        }
      })(),
    );
  }
});

/** Garde seulement les N dernières pages consultées. */
async function limiter(cache, max) {
  const cles = await cache.keys();
  for (let i = 0; i < cles.length - max; i++) await cache.delete(cles[i]);
}

'use client';
import { useEffect } from 'react';

/** Enregistre le service worker (production uniquement). L'installation reste facultative. */
export function EnregistrementServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const enregistrer = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
        /* sans service worker, le site fonctionne normalement */
      });
    };
    if (document.readyState === 'complete') enregistrer();
    else window.addEventListener('load', enregistrer, { once: true });
  }, []);
  return null;
}

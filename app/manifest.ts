import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'EDM République Villeurbanne',
    short_name: 'EDM',
    description: 'Église de maison à Villeurbanne : rencontres et bibliothèque de prédications et de fiches.',
    lang: 'fr',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f2eb',
    theme_color: '#f6f2eb',
    icons: [
      { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/assets/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Bibliothèque', url: '/bibliotheque', icons: [{ src: '/assets/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Nous rejoindre', url: '/nous-rejoindre', icons: [{ src: '/assets/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}

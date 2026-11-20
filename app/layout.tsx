import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { EnregistrementServiceWorker } from '@/components/EnregistrementServiceWorker';
import { SITE_URL } from '@/lib/env';
import './globals.css';

// Police de la maquette (géométrique arrondie), hébergée avec le site
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' });

const NOM = 'EDM République Villeurbanne';
const DESCRIPTION =
  'Église de maison à Villeurbanne : présentation, rencontres du jeudi et bibliothèque de prédications et de fiches à consulter librement.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: NOM, template: `%s · ${NOM}` },
  description: DESCRIPTION,
  applicationName: 'EDM',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: NOM,
    title: NOM,
    description: DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: NOM }],
  },
  twitter: { card: 'summary_large_image', title: NOM, description: DESCRIPTION, images: ['/og.png'] },
  icons: {
    icon: [{ url: '/assets/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/assets/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: 'EDM', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#f6f2eb',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="min-h-dvh">
        {children}
        <EnregistrementServiceWorker />
      </body>
    </html>
  );
}

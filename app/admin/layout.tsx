import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Administration', template: '%s · Administration EDM' },
  robots: { index: false, follow: false, nocache: true },
};

export default function MiseEnPageAdmin({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-papier">{children}</div>;
}

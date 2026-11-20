import Image from 'next/image';
import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import type { Reglages } from '@/lib/types';
import { lienTelephone } from '@/lib/outils';
import { LIENS_NAV } from './navigation';

export function PiedDePage({ reglages }: { reglages: Reglages }) {
  return (
    <footer className="mt-20 bg-vert pb-[calc(5rem+env(safe-area-inset-bottom))] text-clair lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <span className="inline-flex rounded-2xl bg-clair p-3">
            <Image src="/assets/logo-lockup.png" alt={reglages.church_name} width={1085} height={400} className="h-10 w-auto" />
          </span>
          <p className="max-w-sm text-clair-2">
            {reglages.meeting_label} chaque {reglages.meeting_day} à partir de {reglages.meeting_time}. {reglages.address}.
          </p>
        </div>
        <nav aria-label="Plan du site">
          <h2 className="mb-4 text-sm font-semibold tracking-[.12em] text-clair-2 uppercase">Le site</h2>
          <ul className="space-y-1">
            {LIENS_NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-10 items-center hover:underline">
                  {l.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-[.12em] text-clair-2 uppercase">Nous écrire</h2>
          <ul className="space-y-1">
            {reglages.contact_email && (
              <li>
                <a href={`mailto:${reglages.contact_email}`} className="inline-flex min-h-10 items-center gap-2 break-all hover:underline">
                  <Mail aria-hidden size={17} /> {reglages.contact_email}
                </a>
              </li>
            )}
            {reglages.phone && (
              <li>
                <a href={lienTelephone(reglages.phone)} className="inline-flex min-h-10 items-center gap-2 hover:underline">
                  <Phone aria-hidden size={17} /> {reglages.phone}
                </a>
              </li>
            )}
            {reglages.whatsapp_url && (
              <li>
                <a href={reglages.whatsapp_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 hover:underline">
                  <MessageCircle aria-hidden size={17} /> WhatsApp
                </a>
              </li>
            )}
            <li>
              <Link href="/nous-rejoindre#contact" className="inline-flex min-h-10 items-center hover:underline">
                Formulaire de contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 px-5 py-6 text-center text-sm text-clair-2">
        © {new Date().getFullYear()} {reglages.church_name}
      </p>
    </footer>
  );
}

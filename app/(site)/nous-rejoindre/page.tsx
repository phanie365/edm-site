import type { Metadata } from 'next';
import { CalendarDays, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { Contenu } from '@/components/Contenu';
import { Visuel } from '@/components/Visuel';
import { Conteneur, EnTetePage } from '@/components/ui';
import { lirePages, lireReglages } from '@/lib/donnees';
import { contactConfigure } from '@/lib/env';
import { lienItineraire, lienTelephone } from '@/lib/outils';
import { FormulaireContact } from './FormulaireContact';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const r = await lireReglages();
  const description = `${r.meeting_label} chaque ${r.meeting_day} à partir de ${r.meeting_time}, ${r.address}. Venez nous rencontrer ou écrivez-nous.`;
  return {
    title: 'Nous rejoindre',
    description,
    alternates: { canonical: '/nous-rejoindre' },
    openGraph: { title: 'Nous rejoindre', description, url: '/nous-rejoindre' },
  };
}

/** Page unique « Nous rejoindre » : rencontres, adresse, et contact (formulaire + coordonnées). */
export default async function NousRejoindre() {
  const [r, pages] = await Promise.all([lireReglages(), lirePages()]);
  const infos = pages.rejoindre;
  const [premier, ...suite] = (infos?.content ?? '').split(/\n\s*\n/);
  const formulaire = contactConfigure();
  const coordonnees = [
    r.contact_email && { href: `mailto:${r.contact_email}`, icone: Mail, libelle: r.contact_email, externe: false },
    ...r.contacts.map((c) => ({ href: lienTelephone(c.telephone), icone: Phone, libelle: `${c.nom} · ${c.telephone}`, externe: false })),
    r.whatsapp_url && { href: r.whatsapp_url, icone: MessageCircle, libelle: 'Nous écrire sur WhatsApp', externe: true },
  ].filter(Boolean) as { href: string; icone: typeof Mail; libelle: string; externe: boolean }[];

  return (
    <Conteneur>
      <EnTetePage titre={infos?.title || 'Nous rejoindre'} chapo={premier} />

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
        {/* ---------- Venir nous voir ---------- */}
        <div className="space-y-4">
          <section aria-labelledby="titre-rencontres" className="carte flex gap-5 p-6 sm:p-8">
            <span className="flex size-12 flex-none items-center justify-center rounded-2xl bg-papier-2 text-vert">
              <CalendarDays aria-hidden size={22} />
            </span>
            <div>
              <h2 id="titre-rencontres" className="text-xl font-bold">
                {r.meeting_label}
              </h2>
              <p className="mt-1 text-lg text-encre-3">
                Chaque {r.meeting_day}
                <br />à partir de {r.meeting_time}
              </p>
            </div>
          </section>

          <section aria-labelledby="titre-adresse" className="carte flex gap-5 p-6 sm:p-8">
            <span className="flex size-12 flex-none items-center justify-center rounded-2xl bg-papier-2 text-vert">
              <MapPin aria-hidden size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="titre-adresse" className="text-xl font-bold">
                Adresse
              </h2>
              <p className="mt-1 text-lg whitespace-pre-line text-encre-3">{r.address}</p>
              {r.address_details && <p className="mt-2 text-encre-2">{r.address_details}</p>}
              <a href={lienItineraire(r.address)} target="_blank" rel="noopener noreferrer" className="bouton bouton-contour bouton-petit mt-5">
                <Navigation aria-hidden size={17} /> Itinéraire<span className="sr-only"> (ouvre une application de cartes)</span>
              </a>
            </div>
          </section>

          {suite.length > 0 && (
            <section aria-labelledby="titre-infos" className="space-y-4 pt-4">
              <h2 id="titre-infos" className="text-2xl font-bold">
                Bon à savoir
              </h2>
              <Contenu texte={suite.join('\n\n')} />
            </section>
          )}

          <Visuel chemin={r.join_image_path} alt="" sizes="(min-width: 1024px) 560px, 100vw" className="mt-4 aspect-[4/3] rounded-[28px] max-lg:hidden" />
        </div>

        {/* ---------- Nous contacter ---------- */}
        <section id="contact" aria-labelledby="titre-contact" className="scroll-mt-24 space-y-5 lg:sticky lg:top-28">
          <div>
            <h2 id="titre-contact" className="text-3xl font-bold">
              Nous contacter
            </h2>
            <p className="mt-2 text-lg text-encre-3">Une question, ou envie de venir une première fois ? Contactez-nous.</p>
          </div>

          {formulaire && <FormulaireContact />}

          {coordonnees.length > 0 ? (
            <div className="space-y-3">
              {formulaire && <p className="font-semibold text-encre-2">Ou directement :</p>}
              <ul className="divide-y divide-bordure overflow-hidden rounded-carte border border-bordure bg-carte">
                {coordonnees.map(({ href, icone: Icone, libelle, externe }) => (
                  <li key={href}>
                    <a
                      href={href}
                      {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex min-h-16 items-center gap-4 px-5 font-semibold break-all hover:bg-papier"
                    >
                      <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-papier-2 text-vert">
                        <Icone aria-hidden size={19} />
                      </span>
                      {libelle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !formulaire && <p className="carte p-6 text-encre-2">Les coordonnées seront bientôt indiquées ici.</p>
          )}
        </section>
      </div>
    </Conteneur>
  );
}

'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Download, Eye, FileText, Maximize2, Share2 } from 'lucide-react';
import { tailleLisible } from '@/lib/outils';

export interface FicheAffichee {
  id: string;
  nom: string;
  taille: number | null;
  image: boolean;
  urlConsulter: string;
  urlTelecharger: string;
}

/**
 * Fiches d'une ressource, dans l'ordre choisi dans l'admin.
 * Image : affichée en grand, avec Agrandir (taille réelle, zoom possible), Télécharger, Partager.
 * PDF : ligne avec Consulter, Télécharger, Partager.
 */
export function ListeFiches({ fiches, titreRessource }: { fiches: FicheAffichee[]; titreRessource: string }) {
  const [message, setMessage] = useState('');

  const partager = async (f: FicheAffichee) => {
    const donnees = { title: `${f.nom} – ${titreRessource}`, url: f.urlConsulter };
    try {
      if (navigator.share) {
        await navigator.share(donnees);
      } else {
        await navigator.clipboard.writeText(f.urlConsulter);
        setMessage(`Lien de « ${f.nom} » copié.`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      /* partage annulé par la personne : rien à faire */
    }
  };

  const boutonPartager = (f: FicheAffichee) => (
    <button type="button" onClick={() => partager(f)} className="bouton bouton-contour bouton-petit w-11 flex-none px-0" aria-label={`Partager « ${f.nom} »`}>
      <Share2 aria-hidden size={17} />
    </button>
  );

  return (
    <>
      <ol className="space-y-6">
        {fiches.map((f, i) =>
          f.image ? (
            <li key={f.id}>
              <figure className="overflow-hidden rounded-carte border border-bordure bg-carte">
                <a href={f.urlConsulter} target="_blank" rel="noopener" className="block bg-white">
                  <Image
                    src={f.urlConsulter}
                    alt={`${f.nom} (fiche ${i + 1} sur ${fiches.length})`}
                    width={1200}
                    height={1600}
                    quality={90}
                    sizes="(min-width: 768px) 720px, 100vw"
                    className="h-auto w-full"
                    priority={i === 0}
                  />
                  <span className="sr-only"> – agrandir (nouvel onglet)</span>
                </a>
                <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:flex-nowrap sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold break-words">{f.nom}</p>
                    <p className="text-sm text-encre-2">
                      Fiche {i + 1} / {fiches.length}
                    </p>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <a href={f.urlConsulter} target="_blank" rel="noopener" className="bouton bouton-contour bouton-petit min-w-0 flex-1 px-3 sm:flex-none sm:px-4">
                      <Maximize2 aria-hidden size={17} /> Agrandir<span className="sr-only"> « {f.nom} » (nouvel onglet)</span>
                    </a>
                    <a href={f.urlTelecharger} download className="bouton bouton-plein bouton-petit min-w-0 flex-1 px-3 sm:flex-none sm:px-4">
                      <Download aria-hidden size={17} /> Télécharger<span className="sr-only"> « {f.nom} »</span>
                    </a>
                    {boutonPartager(f)}
                  </div>
                </figcaption>
              </figure>
            </li>
          ) : (
            <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-carte border border-bordure bg-carte p-4 sm:flex-nowrap sm:px-5">
              <span aria-hidden className="flex size-11 flex-none items-center justify-center rounded-xl bg-[#fbe9e7] text-youtube">
                <FileText size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold break-words">{f.nom}</p>
                <p className="text-sm text-encre-2">PDF{f.taille ? ` · ${tailleLisible(f.taille)}` : ''}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <a href={f.urlConsulter} target="_blank" rel="noopener" className="bouton bouton-contour bouton-petit min-w-0 flex-1 px-3 sm:flex-none sm:px-4">
                  <Eye aria-hidden size={17} /> Consulter<span className="sr-only"> « {f.nom} » (nouvel onglet)</span>
                </a>
                <a href={f.urlTelecharger} download className="bouton bouton-plein bouton-petit min-w-0 flex-1 px-3 sm:flex-none sm:px-4">
                  <Download aria-hidden size={17} /> Télécharger<span className="sr-only"> « {f.nom} »</span>
                </a>
                {boutonPartager(f)}
              </div>
            </li>
          ),
        )}
      </ol>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-succes">
        {message}
      </p>
    </>
  );
}

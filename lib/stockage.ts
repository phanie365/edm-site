import { BUCKET_FICHES, BUCKET_IMAGES, SUPABASE_URL } from './env';

const base = () => `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public`;
const encoder = (chemin: string) => chemin.split('/').map(encodeURIComponent).join('/');

/** Adresse publique d'une image (couverture, photo du site). */
export const urlImage = (chemin: string | null | undefined) => (chemin ? `${base()}/${BUCKET_IMAGES}/${encoder(chemin)}` : null);

/** Adresse publique d'une fiche (image ou PDF). */
export const urlFiche = (chemin: string) => `${base()}/${BUCKET_FICHES}/${encoder(chemin)}`;

/** La fiche est-elle une image (et non un PDF) ? */
export const ficheEstImage = (chemin: string) => /\.(jpg|png|webp)$/i.test(chemin);

/** Adresse qui force le téléchargement avec un nom de fichier lisible (fonctionne sur iPhone et Android). */
export function urlFicheTelechargement(chemin: string, nomFichier: string) {
  const ext = chemin.slice(chemin.lastIndexOf('.'));
  const nom = nomFichier.toLowerCase().endsWith(ext) ? nomFichier : `${nomFichier}${ext}`;
  return `${urlFiche(chemin)}?download=${encodeURIComponent(nom)}`;
}

import { BUCKET_FICHES, BUCKET_IMAGES, SUPABASE_URL } from './env';

const base = () => `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public`;
const encoder = (chemin: string) => chemin.split('/').map(encodeURIComponent).join('/');

/** Adresse publique d'une image (couverture, photo du site). */
export const urlImage = (chemin: string | null | undefined) => (chemin ? `${base()}/${BUCKET_IMAGES}/${encoder(chemin)}` : null);

/** Adresse publique d'un PDF, pour le consulter dans le navigateur. */
export const urlPdf = (chemin: string) => `${base()}/${BUCKET_FICHES}/${encoder(chemin)}`;

/** Adresse qui force le téléchargement avec un nom de fichier lisible (fonctionne sur iPhone et Android). */
export function urlPdfTelechargement(chemin: string, nomFichier: string) {
  const nom = nomFichier.toLowerCase().endsWith('.pdf') ? nomFichier : `${nomFichier}.pdf`;
  return `${urlPdf(chemin)}?download=${encodeURIComponent(nom)}`;
}

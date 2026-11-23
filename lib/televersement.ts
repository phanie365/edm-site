'use client';
import { BUCKET_FICHES, BUCKET_IMAGES, TAILLE_MAX_IMAGE, TAILLE_MAX_PDF } from './env';
import { clientNavigateur } from './supabase/navigateur';

/**
 * Dépôt direct navigateur → Supabase Storage (avec la session de l'administrateur).
 * Évite la limite de taille des requêtes serveur (Vercel : 4,5 Mo).
 * Contrôles : ici (type, taille, signature du fichier), puis dans Storage
 * (types autorisés, taille max, droits admin), puis côté serveur (chemin, existence).
 */

async function commencePar(fichier: File, octets: number[]): Promise<boolean> {
  const debut = new Uint8Array(await fichier.slice(0, octets.length).arrayBuffer());
  return octets.every((o, i) => debut[i] === o);
}

export async function verifierPdf(fichier: File): Promise<string | null> {
  if (!/\.pdf$/i.test(fichier.name) && fichier.type !== 'application/pdf') return `« ${fichier.name} » : format non accepté (image JPEG, PNG, WebP ou PDF).`;
  if (fichier.size > TAILLE_MAX_PDF) return `« ${fichier.name} » est trop lourd (25 Mo maximum).`;
  if (fichier.size === 0) return `« ${fichier.name} » est vide.`;
  if (!(await commencePar(fichier, [0x25, 0x50, 0x44, 0x46, 0x2d]))) return `« ${fichier.name} » n’est pas un PDF valide.`;
  return null;
}

const TYPES_IMAGES: Record<string, { ext: string; signature: number[] }> = {
  'image/jpeg': { ext: 'jpg', signature: [0xff, 0xd8, 0xff] },
  'image/png': { ext: 'png', signature: [0x89, 0x50, 0x4e, 0x47] },
  'image/webp': { ext: 'webp', signature: [0x52, 0x49, 0x46, 0x46] },
};

export async function verifierImage(fichier: File): Promise<string | null> {
  const t = TYPES_IMAGES[fichier.type];
  if (!t) return 'Format non accepté : utilisez une image JPEG, PNG ou WebP.';
  if (fichier.size > TAILLE_MAX_IMAGE) return 'Image trop lourde (5 Mo maximum).';
  if (!(await commencePar(fichier, t.signature))) return 'Ce fichier n’est pas une image valide.';
  return null;
}

/** Nom lisible tiré du fichier : « 01_la-foi.jpg » → « 01 la foi » */
export const nomDepuisFichier = (nom: string) =>
  nom.replace(/\.(pdf|jpe?g|png|webp)$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Fiche';

const COTE_MAX_FICHE = 2400; // pixels : assez pour lire une fiche zoomée, sans fichier énorme
const POIDS_SANS_REDUCTION = 2.5 * 1024 * 1024;

/** Réduit les photos très lourdes (téléphone) en JPEG de bonne qualité ; laisse les autres intactes. */
async function reduireSiBesoin(fichier: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
    const echelle = Math.min(1, COTE_MAX_FICHE / Math.max(bitmap.width, bitmap.height));
    if (echelle === 1 && fichier.size <= POIDS_SANS_REDUCTION) {
      bitmap.close();
      return fichier;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * echelle);
    canvas.height = Math.round(bitmap.height * echelle);
    const ctx = canvas.getContext('2d');
    if (!ctx) return fichier;
    ctx.fillStyle = '#ffffff'; // fond blanc pour les images transparentes
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.88));
    if (!blob || blob.size >= fichier.size) return fichier;
    return new File([blob], fichier.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return fichier;
  }
}

/** Dépose une fiche : une image (JPEG, PNG, WebP) ou un PDF. */
export async function deposerFiche(ressourceId: string, original: File): Promise<{ chemin: string; taille: number } | { erreur: string }> {
  let fichier = original;
  let ext = 'pdf';
  if (original.type.startsWith('image/')) {
    if (!TYPES_IMAGES[original.type]) return { erreur: `« ${original.name} » : format non accepté (JPEG, PNG ou WebP).` };
    if (!(await commencePar(original, TYPES_IMAGES[original.type]!.signature))) return { erreur: `« ${original.name} » n’est pas une image valide.` };
    fichier = await reduireSiBesoin(original);
    if (fichier.size > TAILLE_MAX_PDF) return { erreur: `« ${original.name} » est trop lourd (25 Mo maximum).` };
    ext = TYPES_IMAGES[fichier.type]!.ext;
  } else {
    const probleme = await verifierPdf(original);
    if (probleme) return { erreur: probleme };
  }
  const chemin = `ressources/${ressourceId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await clientNavigateur().storage.from(BUCKET_FICHES).upload(chemin, fichier, {
    contentType: fichier.type || 'application/pdf',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return { erreur: traduireStockage(error.message, original.name) };
  return { chemin, taille: fichier.size };
}

export async function deposerImage(dossier: 'couvertures' | 'site', fichier: File): Promise<{ chemin: string } | { erreur: string }> {
  const probleme = await verifierImage(fichier);
  if (probleme) return { erreur: probleme };
  const chemin = `${dossier}/${crypto.randomUUID()}.${TYPES_IMAGES[fichier.type]!.ext}`;
  const { error } = await clientNavigateur().storage.from(BUCKET_IMAGES).upload(chemin, fichier, {
    contentType: fichier.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return { erreur: traduireStockage(error.message, fichier.name) };
  return { chemin };
}

/** Supprime un fichier déposé si l'enregistrement a échoué ensuite. */
export async function annulerDepot(bucket: 'fiches' | 'images', chemin: string) {
  await clientNavigateur().storage.from(bucket).remove([chemin]);
}

function traduireStockage(message: string, nom: string): string {
  const m = message.toLowerCase();
  if (m.includes('row-level security') || m.includes('unauthorized')) return 'Envoi refusé : votre session a peut-être expiré. Reconnectez-vous.';
  if (m.includes('mime type')) return `« ${nom} » : format refusé.`;
  if (m.includes('maximum allowed size') || m.includes('too large')) return `« ${nom} » est trop lourd.`;
  return `« ${nom} » n’a pas pu être envoyé : ${message}`;
}

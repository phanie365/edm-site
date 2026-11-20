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
  if (!/\.pdf$/i.test(fichier.name) && fichier.type !== 'application/pdf') return `« ${fichier.name} » n’est pas un PDF.`;
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

/** Nom lisible tiré du fichier : « 01_la-foi.pdf » → « 01 la foi » */
export const nomDepuisFichier = (nom: string) =>
  nom.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Fiche';

export async function deposerPdf(ressourceId: string, fichier: File): Promise<{ chemin: string } | { erreur: string }> {
  const probleme = await verifierPdf(fichier);
  if (probleme) return { erreur: probleme };
  const chemin = `ressources/${ressourceId}/${crypto.randomUUID()}.pdf`;
  const { error } = await clientNavigateur().storage.from(BUCKET_FICHES).upload(chemin, fichier, {
    contentType: 'application/pdf',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return { erreur: traduireStockage(error.message, fichier.name) };
  return { chemin };
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

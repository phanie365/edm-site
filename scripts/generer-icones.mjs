/**
 * Génère les icônes PWA et l'image d'aperçu (réseaux sociaux / WhatsApp)
 * à partir des logos existants : public/assets/logo-mark.png et logo-lockup.png.
 *   npm run icones            → crée seulement les fichiers manquants
 *   npm run icones -- --force → recrée tout (après un changement de logo)
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = join(racine, 'public/assets/logo-mark.png');
const lockup = join(racine, 'public/assets/logo-lockup.png');
const dossier = join(racine, 'public/assets/icons');
const PAPIER = { r: 244, g: 241, b: 236, alpha: 1 };
const force = process.argv.includes('--force');

for (const f of [mark, lockup]) if (!existsSync(f)) { console.error(`Logo introuvable : ${f}`); process.exit(1); }
mkdirSync(dossier, { recursive: true });

const carre = async () => {
  const buf = await sharp(mark).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const { width: w, height: h } = await sharp(buf).metadata();
  const c = Math.max(w, h);
  return sharp(buf).extend({ top: Math.floor((c - h) / 2), bottom: Math.ceil((c - h) / 2), left: Math.floor((c - w) / 2), right: Math.ceil((c - w) / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
};

const ICONES = { 'icon-192.png': [192, 0.8, true], 'icon-512.png': [512, 0.8, true], 'icon-maskable-512.png': [512, 0.62, true], 'apple-touch-icon.png': [180, 0.78, true], 'favicon-32.png': [32, 1, false] };
let logo;
for (const [nom, [t, part, papier]] of Object.entries(ICONES)) {
  const cible = join(dossier, nom);
  if (existsSync(cible) && !force) { console.log(`  déjà présent : ${nom}`); continue; }
  logo ??= await carre();
  const interieur = await sharp(logo).resize(Math.round(t * part), Math.round(t * part)).png().toBuffer();
  let img = sharp({ create: { width: t, height: t, channels: 4, background: papier ? PAPIER : { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: interieur, gravity: 'center' }]);
  if (papier) img = img.flatten({ background: PAPIER });
  await img.png().toFile(cible);
  console.log(`  créé : ${nom}`);
}

// Image d'aperçu 1200×630 (Open Graph)
const og = join(racine, 'public/og.png');
if (!existsSync(og) || force) {
  const l = await sharp(lockup).resize({ width: 760 }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: PAPIER } })
    .composite([{ input: l, gravity: 'center' }])
    .flatten({ background: PAPIER })
    .png()
    .toFile(og);
  console.log('  créé : og.png');
}
console.log('Terminé.');

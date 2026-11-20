import { describe, expect, it } from 'vitest';
import { blocsDeTexte, dateLongue, extrait, idYoutube, lienTelephone, slugifier, tailleLisible } from '../lib/outils';

describe('idYoutube', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?feature=share&v=abc123DEF_-', 'abc123DEF_-'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=xyz', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('reconnaît %s', (url, id) => expect(idYoutube(url)).toBe(id));

  it.each(['https://vimeo.com/123', 'https://www.youtube.com/', 'pas une url', '', null, 'javascript:alert(1)', 'https://youtube.com.evil.fr/watch?v=dQw4w9WgXcQ'])(
    'refuse %s',
    (url) => expect(idYoutube(url)).toBeNull(),
  );
});

describe('slugifier', () => {
  it('retire accents, apostrophes et ponctuation', () => {
    expect(slugifier('La Sainte-Cène : l’Alliance (1re partie)')).toBe('la-sainte-cene-l-alliance-1re-partie');
    expect(slugifier('  Prière !!  ')).toBe('priere');
    expect(slugifier('???')).toBe('');
  });
  it('limite la longueur sans tiret final', () => {
    const s = slugifier('mot '.repeat(60));
    expect(s.length).toBeLessThanOrEqual(100);
    expect(s.endsWith('-')).toBe(false);
  });
});

describe('blocsDeTexte', () => {
  it('sépare paragraphes et listes, sans interpréter le HTML', () => {
    const blocs = blocsDeTexte('Premier\nparagraphe.\n\n- un\n- deux\n\n<script>x</script>');
    expect(blocs).toEqual([
      { type: 'paragraphe', texte: 'Premier paragraphe.' },
      { type: 'liste', elements: ['un', 'deux'] },
      { type: 'paragraphe', texte: '<script>x</script>' },
    ]);
  });
  it('gère le vide', () => {
    expect(blocsDeTexte('')).toEqual([]);
    expect(blocsDeTexte(null)).toEqual([]);
  });
});

describe('formats', () => {
  it('tailleLisible', () => {
    expect(tailleLisible(500)).toBe('500 o');
    expect(tailleLisible(2048)).toBe('2 Ko');
    expect(tailleLisible(1_258_291)).toBe('1,2 Mo');
    expect(tailleLisible(null)).toBe('');
  });
  it('dateLongue sans décalage de fuseau', () => expect(dateLongue('2026-11-15')).toBe('15 novembre 2026'));
  it('extrait coupe sur un mot', () => {
    const e = extrait('un deux trois quatre cinq six sept huit neuf dix', 20);
    expect(e.endsWith('…')).toBe(true);
    expect(e.length).toBeLessThanOrEqual(21);
  });
  it('lienTelephone', () => expect(lienTelephone('06 12 34 56 78')).toBe('tel:0612345678'));
});

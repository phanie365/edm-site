import { describe, expect, it } from 'vitest';
import { erreursParChamp, schemaContact, schemaFiche, schemaImage, schemaRessource } from '../lib/schemas';

const ressourceValide = {
  title: 'La foi',
  description: '',
  youtube_url: '',
  category_id: '',
  biblical_references: '',
  resource_date: '',
  is_published: false,
};

describe('schemaRessource', () => {
  it('accepte une ressource avec seulement un titre (vidéo et PDF facultatifs)', () => {
    const r = schemaRessource.parse(ressourceValide);
    expect(r).toMatchObject({ title: 'La foi', youtube_url: null, description: null, category_id: null, resource_date: null });
  });
  it('exige un titre', () => {
    const r = schemaRessource.safeParse({ ...ressourceValide, title: '   ' });
    expect(r.success).toBe(false);
    if (!r.success) expect(erreursParChamp(r.error).title).toBe('Le titre est obligatoire.');
  });
  it('refuse un lien qui n’est pas YouTube', () => {
    const r = schemaRessource.safeParse({ ...ressourceValide, youtube_url: 'https://vimeo.com/1' });
    expect(r.success).toBe(false);
  });
  it('accepte un lien youtu.be', () => {
    expect(schemaRessource.safeParse({ ...ressourceValide, youtube_url: 'https://youtu.be/dQw4w9WgXcQ' }).success).toBe(true);
  });
});

describe('schemaFiche', () => {
  const id = '3f2b8c1e-4d5a-4b6c-9d8e-7f6a5b4c3d2e';
  it('accepte un chemin dans le dossier de la ressource', () => {
    expect(schemaFiche.safeParse({ resource_id: id, storage_path: `ressources/${id}/${id}.pdf`, file_name: 'Fiche 1', size_bytes: 1000 }).success).toBe(true);
  });
  it.each([`ressources/autre/${id}.pdf`, `ressources/${id}/../x.pdf`, `ressources/${id}/${id}.exe`, '/etc/passwd'])('refuse le chemin %s', (chemin) => {
    expect(schemaFiche.safeParse({ resource_id: id, storage_path: chemin, file_name: 'x', size_bytes: 10 }).success).toBe(false);
  });
  it('refuse un fichier de plus de 25 Mo', () => {
    expect(schemaFiche.safeParse({ resource_id: id, storage_path: `ressources/${id}/${id}.pdf`, file_name: 'x', size_bytes: 26 * 1024 * 1024 }).success).toBe(false);
  });
});

describe('schemaImage', () => {
  it('n’accepte que des couvertures, au bon format', () => {
    const id = '3f2b8c1e-4d5a-4b6c-9d8e-7f6a5b4c3d2e';
    expect(schemaImage.safeParse({ resource_id: id, storage_path: `couvertures/${id}.webp` }).success).toBe(true);
    expect(schemaImage.safeParse({ resource_id: id, storage_path: `site/${id}.jpg` }).success).toBe(false);
    expect(schemaImage.safeParse({ resource_id: id, storage_path: `couvertures/${id}.svg` }).success).toBe(false);
    expect(schemaImage.safeParse({ resource_id: id, storage_path: `../${id}.png` }).success).toBe(false);
  });
});

describe('schemaContact', () => {
  const ok = { nom: 'Marie', email: 'marie@exemple.fr', message: 'Bonjour, je voudrais venir jeudi.', site_web: '', ouvert_le: Date.now() };
  it('accepte un message correct', () => expect(schemaContact.safeParse(ok).success).toBe(true));
  it('refuse si le piège anti-robot est rempli', () => expect(schemaContact.safeParse({ ...ok, site_web: 'http://spam' }).success).toBe(false));
  it('refuse un message trop court ou un email invalide', () => {
    const r = schemaContact.safeParse({ ...ok, message: 'Salut', email: 'x' });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(erreursParChamp(r.error)).sort()).toEqual(['email', 'message']);
  });
});

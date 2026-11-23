-- =====================================================================
-- À exécuter SEULEMENT si la base a été installée avant le 23/11/2026
-- (sinon installation.sql contient déjà ces textes).
-- Accueil bref : petit titre, phrase de vision, pas de points forts,
-- textes provisoires retirés (un texte vide n'apparaît pas sur le site).
-- =====================================================================
update public.site_settings
   set hero_kicker = 'Église de maison République Villeurbanne',
       address     = '61 rue Anatole France, 69100 Villeurbanne',
       highlights  = '[]'::jsonb
 where id;

update public.site_pages set content = 'Au sein de l’EDM République, notre vision est de diffuser l’amour.' where slug = 'vision';
update public.site_pages set content = 'Partageons ensemble un temps autour de la Parole.' where slug = 'rejoindre';
update public.site_pages set content = ''
 where slug in ('presentation', 'histoire', 'valeurs', 'fonctionnement')
   and content like 'Texte provisoire%';

-- Contacts nommés (remplace l'ancien champ « phone »)
alter table public.site_settings add column if not exists contacts jsonb not null default '[]'::jsonb;
update public.site_settings
   set contacts = '[{"nom": "Clotilde", "telephone": "06 51 99 94 22"}, {"nom": "Ephrem", "telephone": "07 87 07 20 22"}]'::jsonb
 where id;
alter table public.site_settings drop column if exists phone;
do $$ begin
  alter table public.site_settings add constraint contacts_valides check (
    jsonb_typeof(contacts) = 'array' and jsonb_array_length(contacts) <= 4
    and not jsonb_path_exists(contacts, '$[*] ? (@.type() != "object" || !exists(@.nom) || !exists(@.telephone))'));
exception when duplicate_object then null; end $$;

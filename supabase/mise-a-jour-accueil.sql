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

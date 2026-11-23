-- =====================================================================
-- À utiliser SEULEMENT si vous aviez déjà exécuté une ancienne version
-- d'installation.sql. Supprime les tables et fonctions du site, puis
-- exécutez de nouveau installation.sql, puis creer_admin.sql.
--
-- ⚠ Efface les ressources et fiches enregistrées (la bibliothèque doit être vide).
--   Les comptes (Authentication > Users) ne sont PAS supprimés.
-- =====================================================================

drop table if exists public.resource_files, public.resources, public.categories,
                     public.site_settings, public.site_pages, public.admins cascade;

do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('sans_accents', 'is_admin', 'rechercher_ressources', 'reordonner_fiches',
                        'mettre_a_jour_avancement', 'maj_updated_at')
  loop
    execute format('drop function if exists %s cascade', f.sig);
  end loop;
end $$;

drop policy if exists "admin lit les fichiers"      on storage.objects;
drop policy if exists "admin depose des fichiers"   on storage.objects;
drop policy if exists "admin remplace des fichiers" on storage.objects;
drop policy if exists "admin supprime des fichiers" on storage.objects;

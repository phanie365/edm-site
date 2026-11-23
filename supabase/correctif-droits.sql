-- =====================================================================
-- Correctif : à exécuter UNE FOIS si le site affiche « Le contenu n'a pas pu être chargé »
-- alors que les variables Vercel sont correctes (erreur « permission denied » côté Supabase).
-- Les projets Supabase récents ne donnent plus de droits par défaut sur les tables ;
-- la sécurité (RLS) continue de limiter les visiteurs au contenu publié, en lecture seule.
-- (Déjà inclus dans installation.sql pour une nouvelle installation.)
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.site_pages, public.resources, public.resource_files to anon, authenticated;
grant select on public.admins to authenticated;
grant insert, update, delete on public.resources, public.resource_files to authenticated;
grant update on public.site_settings, public.site_pages to authenticated;
revoke insert, update, delete, truncate on all tables in schema public from anon;

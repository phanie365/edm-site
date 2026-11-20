-- =====================================================================
-- Déclarer un administrateur du site.
-- 1. Supabase > Authentication > Users > « Add user » > « Create new user »
--    (email + mot de passe solide, cochez « Auto Confirm User »).
-- 2. Remplacez l'email ci-dessous, puis exécutez ce script dans le SQL Editor.
-- Pour retirer un administrateur :
--   delete from public.admins where user_id = (select id from auth.users where email = '...');
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'VOTRE-EMAIL@exemple.fr'
on conflict do nothing;

-- Vérification : doit afficher l'email
select u.email from public.admins a join auth.users u on u.id = a.user_id;

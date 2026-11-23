-- =====================================================================
-- Déclarer un administrateur
--
-- 1. Supabase > Authentication > Users > « Add user » > « Create new user »
--      Email    : edmrepublique@gmail.com
--      Password : le mot de passe de votre choix (12 caractères ou plus)
--      Cochez « Auto Confirm User »
-- 2. Exécutez ce script (SQL Editor > New query > Run).
-- 3. Sur /admin, connectez-vous avec cet email et ce mot de passe.
--
-- Mot de passe oublié : supprimez l'utilisateur (Authentication > Users > ⋯ > Delete user),
-- recréez-le (étape 1) avec un nouveau mot de passe, puis relancez ce script.
-- Autre administrateur : même démarche avec son email, en remplaçant l'adresse ci-dessous.
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'edmrepublique@gmail.com'
on conflict do nothing;

-- Vérification : doit afficher l'email
select u.email from public.admins a join auth.users u on u.id = a.user_id;

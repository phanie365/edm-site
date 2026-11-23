-- =====================================================================
-- Créer un administrateur (connexion avec un IDENTIFIANT + mot de passe)
--
-- 1. Supabase > Authentication > Users > « Add user » > « Create new user »
--      Email    : <identifiant>@edm-republique.local   (ex. clotilde@edm-republique.local)
--      Password : le mot de passe de votre choix (12 caractères ou plus)
--      Cochez « Auto Confirm User »
--    (Un vrai email fonctionne aussi : la connexion se fait alors avec cet email.)
--
-- 2. Remplacez « clotilde » ci-dessous par l'identifiant choisi, puis « Run ».
--
-- 3. Sur /admin, connectez-vous avec l'identifiant (ex. « clotilde ») et le mot de passe.
--
-- Pour retirer un administrateur :
--   delete from public.admins where user_id = (select id from auth.users where email = 'clotilde@edm-republique.local');
-- Pour changer un mot de passe : Authentication > Users > ⋯ > « Reset password » n'envoie un email
-- qu'aux vraies adresses ; pour un identifiant, supprimez puis recréez l'utilisateur (étape 1 et 2).
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'clotilde@edm-republique.local'
on conflict do nothing;

-- Vérification : doit afficher le compte
select replace(u.email, '@edm-republique.local', '') as identifiant
from public.admins a join auth.users u on u.id = a.user_id;

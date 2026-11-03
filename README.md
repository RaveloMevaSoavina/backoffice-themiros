# Backoffice Themiros

Administration de la plateforme par l'équipe Themiros, toutes organisations
confondues : organisations, profils, invitations, projets (espaces de travail)
et facturation.

Même stack que le dashboard : Vite, React 19, Tailwind 4, shadcn (style
`radix-nova`), Supabase et TanStack Query. Les composants de
`src/shared/ui/base` sont repris du dashboard.

## Démarrer

```bash
cp .env.example .env.local   # mêmes VITE_SUPABASE_* que le dashboard
npm install
npm run dev                  # http://localhost:5174 (le dashboard garde 5173)
npm run api:dev              # API Themiros, pour l'envoi des invitations
```

Avant la première ouverture :

1. Appliquer la migration
   `dashboard-themiros/supabase/migrations/20261103000001_backoffice.sql`
   (la chaîne de migrations reste dans le dashboard : c'est la même base).
2. Nommer le premier administrateur, dans le SQL editor :

   ```sql
   insert into public.platform_admins (profile_id)
   select id from auth.users where email = 'prenom@evoranq.com';
   ```

   Les suivants se nomment depuis l'écran Profils.
3. Côté API (`api-themiros/.env`) : ajouter l'origine du backoffice à
   `CORS_ALLOWED_ORIGINS` et renseigner `INVITATION_REDIRECT_URL` (page du
   dashboard où mène le lien d'invitation, à déclarer aussi dans les
   Redirect URLs de Supabase Auth).

## Sécurité

- Le navigateur n'a que la clé `anon`. Toutes les lectures et écritures
  passent par les fonctions SQL `backoffice_*` (`SECURITY DEFINER`), qui
  commencent par `assert_platform_admin()`. Le garde de l'interface
  (`AuthGuard`) n'est qu'un confort : la base refait le contrôle à chaque
  appel.
- Aucune policy RLS existante n'est élargie. Le dashboard lit les espaces
  d'un compte par la seule RLS de `workspace_members` : une policy
  « l'admin plateforme voit tout » y ferait apparaître les espaces de toutes
  les organisations.
- Les nouvelles tables (`platform_admins`, `organization_invitations`,
  `billing_plans`, `subscriptions`, `invoices`) n'ont aucune policy :
  inaccessibles en direct à `anon` et `authenticated`.
- L'envoi d'une invitation et la création d'un compte demandent la clé
  serveur (GoTrue `/invite`, `/admin/users`) : ils passent par l'API
  (`POST /api/v1/admin/invitations`, `POST /api/v1/admin/profiles`), qui
  vérifie `is_platform_admin()` avec le jeton de l'appelant.

## Écrans

| Route                        | Contenu                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/organizations`             | Liste, création. Comptes, espaces, invitations en attente, offre.                                                                       |
| `/organizations/:id`         | Fiche : comptes, invitations, espaces, abonnement, factures, coordonnées de facturation. Suppression refusée dès qu'une facture existe. |
| `/profiles`                  | Tous les comptes : création manuelle, rôle, organisation (en changer retire le compte des espaces de l'ancienne), accès au backoffice.  |
| `/invitations`               | Invitations par e-mail, avec rôle et espaces à ouvrir ; renvoi, révocation.                                                             |
| `/projects`, `/projects/:id` | Espaces (projets, programmes, politiques) : création, phase, années, membres et rôles, suppression.                                     |
| `/billing`                   | Revenu annuel récurrent, encours, abonnements (consommation d'évaluations, coût IA), factures.                                          |

## Invitations

1. La base enregistre l'invitation (`backoffice_create_invitation`) : elle
   refuse une adresse déjà invitée dans l'organisation ou rattachée à une
   autre organisation.
2. L'API demande à GoTrue d'envoyer le lien. GoTrue crée le compte, et
   `handle_new_user` son profil.
3. L'API rattache le compte à l'organisation, avec son rôle et ses espaces
   (`backoffice_apply_invitation`, clé serveur uniquement).

Un compte déjà confirmé et sans organisation est rattaché sans e-mail. Si
l'envoi échoue, l'invitation enregistrée est retirée. Statut : « acceptée »
dès la première connexion. Révoquer une invitation en attente retire le
compte de l'organisation et, s'il n'existait que par l'invitation, le
supprime.

## Création manuelle d'un profil

Depuis Profils ou la fiche d'une organisation : adresse, nom, mot de passe
(généré, modifiable), rôle et espaces. Aucun e-mail ne part : GoTrue crée le
compte avec l'adresse déjà confirmée, puis l'API le rattache par
`backoffice_update_profile` et `backoffice_set_workspace_member`. Si le
rattachement échoue, le compte est supprimé. L'administrateur transmet
lui-même l'adresse et le mot de passe ; la personne se connecte au dashboard
avec.

## Facturation

Les offres reprennent la page Tarifs de la landing (`billing_plans`) :
Essentiel 4 080 €/an (15 évaluations), Professionnel 15 000 €/an
(40 évaluations), Sur mesure sur devis, et les forfaits Pilote et Campagne.
Le montant réel se négocie : il est porté par l'abonnement.

- Un seul abonnement non résilié par organisation ; les résiliés restent en
  historique.
- Évaluations consommées : espaces créés par l'organisation pendant la
  période de l'abonnement (une évaluation = un espace traité de bout en
  bout).
- Coût IA : registre `ai_usage`, sur la période.
- Facture : brouillon, puis émise (numéro `TH-AAAA-NNNN`, continu par année
  civile), puis payée ou annulée. Une facture émise ne se modifie plus.

La facturation est saisie à la main : pas de paiement en ligne ni de PDF de
facture à ce stade.

## Vérifications

```bash
npm run typecheck && npm run check && npm run build
# Base : dashboard-themiros/supabase/tests/database/backoffice.test.sql
# API  : api-themiros/tests/test_admin_invitations.py
```

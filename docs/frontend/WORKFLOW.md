# WORKFLOW

## Ajouter un utilisateur
1. Aller sur `/users/add`.
2. Remplir le formulaire (nom, email, telephone, mot de passe, robot optionnel).
3. Cliquer sur `Create User`.
4. L API `/api/users` cree le compte, puis redirection vers `/users`.

## Supprimer un utilisateur
1. Aller sur `/users` ou `/admin`.
2. Cliquer sur l icone poubelle.
3. Confirmer la suppression dans la modal.
4. L API `/api/users/:id` supprime l utilisateur.

## Envoyer une demande
1. Sur la page d accueil `/`, cliquer `Reserve Robot`.
2. Remplir le formulaire et envoyer.
3. L API `/api/requests` cree une demande en attente.

## Approuver une demande
1. Aller sur `/requests`.
2. Cliquer sur `Approve`.
3. La page redirige vers `/users/add` avec les donnees pre-remplies.
4. Enregistrer l utilisateur.
5. L API approuve la demande via `/api/requests/:id/approve`.

## Ajouter un robot
1. Aller sur `/robots/add`.
2. Saisir le nom, l id et le statut.
3. Cliquer sur `Create Robot`.
4. L API `/api/robots` cree le robot et redirige vers `/robots`.

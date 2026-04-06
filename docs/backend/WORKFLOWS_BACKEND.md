# WORKFLOWS_BACKEND

## Connexion utilisateur
1. Frontend appelle `POST /api/auth/login`.
2. Backend verifie email + mot de passe.
3. Backend renvoie un JWT + profil user.

## Creation utilisateur (admin)
1. Admin appelle `POST /api/users`.
2. Backend valide les champs.
3. Mot de passe est hash avec bcrypt.
4. Utilisateur enregistre en base.

## Gestion des robots
1. `POST /api/robots` cree un robot.
2. `PUT /api/robots/:id` met a jour status ou coords.
3. `DELETE /api/robots/:id` supprime.

## Demande de reservation
1. Public appelle `POST /api/requests`.
2. Backend cree une demande `pending`.
3. Admin valide avec `PUT /api/requests/:id/approve`.

## Controle robot en temps reel
1. Operateur et robot se connectent au serveur WS `:5002`.
2. Les messages WebRTC sont relayes.
3. Les commandes sont envoyees au robot.

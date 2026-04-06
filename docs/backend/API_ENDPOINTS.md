# API_ENDPOINTS

## Health
- `GET /health`
- Retourne l etat du backend.

## Auth
Base: `/api/auth`
- `POST /register` creer un compte.
- `POST /login` connecter un utilisateur.
- `GET /me` retourner l utilisateur courant.

## Users
Base: `/api/users`
- `POST /` creer un utilisateur. `admin`
- `GET /` lister les utilisateurs. `admin`
- `GET /:id` details utilisateur. `admin`
- `PUT /:id` mettre a jour un utilisateur. `admin`
- `DELETE /:id` supprimer un utilisateur. `admin`

Effets temps reel:
- creation, mise a jour et suppression generent des notifications persistantes.

## Robots
Base: `/api/robots`
- `GET /` lister les robots.
- `POST /` creer un robot. `admin`
- `PUT /:id` mettre a jour un robot. `admin`
- `DELETE /:id` supprimer un robot. `admin`

Effets temps reel:
- les modifications de flotte generent des notifications persistantes.

## Visitor Requests
Base: `/api/requests`
- `POST /` creer une demande visiteur.
- `GET /` lister les demandes en attente. `admin`
- `PUT /:id/approve` approuver une demande. `admin`
- `PUT /:id/reject` refuser une demande. `admin`

Effets temps reel:
- creation, approbation et rejet publient des notifications admin.

## CMS
Base: `/api/cms`
- `GET /company` retourner le contenu entreprise persiste.
- `PUT /company` modifier le contenu entreprise. `admin`

Le profil entreprise est stocke dans PostgreSQL via Prisma.

## Notifications
Base: `/api/notifications`
- `GET /?limit=50&unreadOnly=false` lister les notifications de l utilisateur connecte.
- `POST /` creer une notification ciblee ou globale. `admin`
- `POST /read-all` marquer toutes les notifications comme lues.
- `POST /:id/read` marquer une notification comme lue.

Les notifications sont:
- persistantes en base de donnees
- diffusees en WebSocket en temps reel
- filtrables par role ou utilisateur cible

## Calls
Base: `/api/calls`
- `GET /sessions?limit=50&status=live` lister les sessions d appel.
- `POST /sessions` creer une session d appel.
- `GET /sessions/:id` recuperer une session.
- `POST /sessions/:id/start` passer la session en `live`.
- `POST /sessions/:id/end` terminer la session.
- `POST /sessions/:id/messages` ajouter un message de chat persiste.

Les sessions d appel stockent:
- roomId WebRTC
- mode `audio` ou `video`
- statut `scheduled`, `live`, `ended`
- metadonnees visiteur, operateur et robot
- historique de chat

## Regles d acces
- `protect` verifie le JWT.
- `adminOnly` verifie le role `admin`.
- les sockets WebSocket peuvent s authentifier via `token` dans l URL ou un message `authenticate`.

# BACKEND_REALTIME_REFACTOR_REPORT

## Objectif
Refactoriser le backend pour qu il supporte un vrai systeme d administration de robot telepresence avec:
- persistance CMS reelle
- notifications persistantes et temps reel
- signaling WebRTC multi-room pour appels live audio/video
- chat de session persistant
- structure backend plus propre et presentable pour le PFE

## Technologies utilisees
- `Node.js`
- `Express`
- `Prisma`
- `PostgreSQL`
- `ws` pour WebSocket
- `jsonwebtoken` pour l authentification JWT

## Changements majeurs

### 1. Persistence CMS
Ajout du modele `CompanyProfile` dans Prisma.

Ce modele stocke:
- nom entreprise
- email support
- telephone support
- horaires
- produits/services
- message d accueil
- instructions lobby

Fichiers principaux:
- `backend/prisma/schema.prisma`
- `backend/src/services/company.service.js`
- `backend/src/controllers/cms.controller.js`
- `backend/src/routes/cms.routes.js`

### 2. Notifications persistantes
Ajout des modeles:
- `Notification`
- `NotificationReadReceipt`

Fonctionnalites:
- sauvegarde en base
- ciblage par role
- ciblage par utilisateur
- marquage lu / non lu
- diffusion temps reel via WebSocket

Fichiers principaux:
- `backend/src/services/notification.service.js`
- `backend/src/controllers/notification.controller.js`
- `backend/src/routes/notification.routes.js`

### 3. Signaling WebRTC unifie
Suppression de l ancienne logique globale `operator/robot` unique au profit d un hub temps reel partage.

Le nouveau hub:
- gere plusieurs rooms
- forward `offer`, `answer`, `candidate`
- relaie `command`
- diffuse `peer.joined` et `peer.left`
- met a jour le statut des appels
- conserve une compatibilite legacy avec `ws://localhost:5002`

Fichier principal:
- `backend/src/realtime/realtime-hub.js`

### 4. Sessions d appel persistantes
Ajout des modeles:
- `CallSession`
- `CallMessage`

Chaque session stocke:
- `roomId`
- mode `audio` ou `video`
- statut `scheduled`, `live`, `ended`
- references visiteur / robot / operateur
- historique de messages

Fichiers principaux:
- `backend/src/services/call.service.js`
- `backend/src/controllers/call.controller.js`
- `backend/src/routes/call.routes.js`

### 5. Evenements metier reels
Les operations backend importantes generent maintenant de vraies notifications:
- creation de demande visiteur
- approbation / rejet
- creation / mise a jour / suppression utilisateur
- creation / mise a jour / suppression robot
- mise a jour CMS
- creation / lancement / fin de session d appel

### 6. Correctif robot stable
Le module robot a ete isole de Prisma au runtime.

Pourquoi:
- la table `robots` existante ne se comportait pas de facon fiable avec le mapping Prisma courant
- l ajout et la lecture des robots pouvaient lever une erreur de colonne inexistante

Solution:
- creation de `backend/src/services/robot.service.js`
- utilisation de requetes SQL PostgreSQL directes pour `list`, `create`, `update`, `delete` et `seed`
- conservation des memes routes REST cote frontend et backend

Resultat:
- plus d erreur `prisma.robot.findMany()`
- ajout robot fonctionnel
- liste robot fonctionnelle
- mise a jour et suppression fonctionnelles

## Reorganisation backend
La structure a ete separee en trois couches claires:

### Routes
Expose les endpoints REST.

### Controllers
Gerent la logique HTTP et les reponses.

### Services
Gerent la logique partagee et la persistence.

### Realtime
Gere toute la logique WebSocket et signaling.

## Compatibilite
Le refactor garde:
- le systeme JWT existant
- les routes existantes `auth`, `users`, `robots`, `requests`
- la compatibilite du serveur signaling legacy sur le port `5002`

## Verification realisee
Les points suivants ont ete verifies:
- verification syntaxique des fichiers backend
- generation Prisma Client
- synchronisation schema Prisma vers PostgreSQL avec `prisma db push`
- validation des services Prisma avec acces reel a la base
- test de relay WebSocket entre deux clients dans une meme room
- test de diffusion d une notification persistante vers un client admin authentifie

## Variables d environnement
Nouvelles variables documentees:
- `WS_PATH`
- `SIGNALING_PORT`
- `SIGNALING_HOST`

Variables existantes conservees:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

## Resultat final
Le backend est maintenant:
- plus modulaire
- plus propre
- pret pour des appels live bi-directionnels
- pret pour des notifications admin en temps reel
- capable de stocker le contenu CMS en base
- plus solide pour une demonstration de PFE

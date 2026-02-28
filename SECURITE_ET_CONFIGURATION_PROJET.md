# Securite et Configuration du Projet (manques + plan d'action)

Ce document liste ce qui manque actuellement dans le projet et comment corriger proprement.

## 1. Resume des manques identifies

## 1.1 Secrets et hygiene Git

Problemes constates:

- `backend/.env` est versionne (contient `JWT_SECRET`)
- `backend/node_modules` est versionne
- Pas de `.gitignore` a la racine ni dans `backend/`

Impact:

- fuite de secrets
- repo lourd et instable
- risque operationnel en production

## 1.2 Authentification / Autorisation

Problemes constates:

- route `/api/auth/register` accepte le `role` depuis le body
- routes robots non protegees par JWT
- endpoint `/api/auth/me` appele par le frontend mais absent backend
- exposition large des utilisateurs (`GET /api/users` sans restriction fine)

Impact:

- escalation de privilege
- acces non autorise aux donnees
- sessions frontend cassees au refresh

## 1.3 Validation et robustesse API

Problemes constates:

- validation d'entrees faible (schemas Mongoose permissifs)
- pas de couche centralisee de validation (Joi/Zod/express-validator)
- gestion d'erreur non harmonisee

Impact:

- donnees incoherentes
- erreurs non predites en prod

## 1.4 Configuration et coherences frontend/backend

Problemes constates:

- melange d'URLs hardcodees `http://localhost:5000` et `/api` via proxy Vite
- CORS hardcode sur une seule origine locale
- script test backend absent
- lint frontend en erreur

Impact:

- comportement different dev/prod
- maintenance difficile

## 2. Correctifs obligatoires (priorite P0)

1. Retirer secrets et artefacts du repo

- ajouter `.gitignore` racine et `backend/.gitignore`
- ignorer: `.env`, `node_modules`, `dist`, logs
- rotation immediate du `JWT_SECRET`

2. Securiser auth/roles

- interdire role admin dans `register` public
- reserver creation admin a un endpoint protege admin
- proteger toutes les routes sensibles (`robots`, `users`, etc.)

3. Ajouter `/api/auth/me`

- verifier token JWT
- retourner l'utilisateur courant minimal (id, name, email, role)

4. Normaliser les URLs API frontend

- utiliser une seule strategie:
  - soit `/api` + proxy Vite en dev
  - soit variable `VITE_API_BASE_URL` en prod

5. Corriger les reponses sensibles

- ne jamais renvoyer `password` hash
- uniformiser erreurs (`{ message, code }`)

## 3. Hardening backend recommande (P1)

## 3.1 Middleware securite

Ajouter:

- `helmet`
- `cors` configure via env
- `express-rate-limit` (login et routes sensibles)
- `hpp` (optionnel)
- `compression` (perf)

Exemple (idee):

```js
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(","), credentials: true }));
```

## 3.2 Validation stricte

Mettre en place pour chaque endpoint:

- email valide
- password min length + regles
- role whitelist
- pagination sur listes
- validation `ObjectId`/UUID selon DB

## 3.3 Politique JWT

- secret fort (>= 32 chars)
- expiration courte (ex: 15m-1h)
- refresh token si besoin
- invalidation session (blacklist/rotation)

## 3.4 Logs et observabilite

- logger structure (pino/winston)
- correlation id par requete
- ne jamais logger mot de passe, token, secret

## 4. Configuration standard projet

## 4.1 Arborescence conseillee

```text
PFE/
  .gitignore
  .editorconfig
  README.md
  docs/
  backend/
    .env.example
    .gitignore
    src/
  frontend/
    .env.example
```

## 4.2 Fichiers env

Backend:

- `.env` (local, non commit)
- `.env.example` (template)

Variables minimales:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=change-me
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=...
```

Frontend:

```env
VITE_API_BASE_URL=/api
```

## 4.3 Scripts npm minimaux

Backend (`package.json`):

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "lint": "eslint .",
    "test": "jest --runInBand"
  }
}
```

Frontend:

- garder `dev/build/lint/preview`
- ajouter tests UI quand possible

## 5. Qualite, tests et CI/CD

## 5.1 Tests minimum

Backend:

- auth (register/login/me)
- RBAC admin/operator
- CRUD users/robots

Frontend:

- login flow
- affichage dashboard selon role
- erreurs API

## 5.2 CI conseillee (GitHub Actions)

Pipeline:

1. install deps
2. lint backend + frontend
3. tests backend + frontend
4. build frontend

Bloquer merge si echec.

## 6. Base de donnees et operations

Pour production:

- backups automatiques
- politique retention
- restauration testee regulierement
- migration schema versionnee (si Postgres -> Prisma migrate)

## 7. Plan d'implementation concret (7 jours)

Jour 1:

- hygiene git + rotation secrets

Jour 2:

- correction auth/roles + endpoint `/auth/me`

Jour 3:

- protection routes robots/users + validations

Jour 4:

- normalisation config env + URLs frontend

Jour 5:

- middleware securite + rate limiting

Jour 6:

- tests critiques auth + RBAC

Jour 7:

- CI + documentation finale

## 8. Checklist finale

- [ ] Secrets hors git
- [ ] Routes sensibles protegees
- [ ] Roles verifies cote backend
- [ ] `/api/auth/me` fonctionnel
- [ ] Validation input sur endpoints critiques
- [ ] URLs API centralisees
- [ ] Lint passe
- [ ] Tests critiques en place
- [ ] CI active


# BACKEND_OVERVIEW

## But du backend
- Fournir les API pour l application de telepresence.
- Gerer l authentification, les utilisateurs, les robots et les demandes.
- Centraliser l acces a la base PostgreSQL via Prisma.

## Technologies
- Node.js + Express 5
- Prisma ORM + PostgreSQL
- JWT pour l authentification
- bcrypt pour le hash des mots de passe
- ws pour le serveur de signaling WebRTC
- dotenv pour les variables d environnement

## Entree principale
- `backend/server.js` charge `src/app.js` et connecte Prisma.
- Le serveur ecoute sur `PORT` (5000 par defaut).

Exemple:
```js
prisma.$connect()
  .then(() => app.listen(PORT))
  .catch((err) => process.exit(1));
```

## Middleware global
- `cors` avec origine configuree via `CORS_ORIGIN`.
- `express.json()` pour parser le JSON.

## Variables d environnement
Fichier exemple: `backend/.env.example`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

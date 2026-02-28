# Migration MongoDB vers PostgreSQL avec Docker (pas a pas)

Ce document explique comment migrer ce projet de `MongoDB + Mongoose` vers `PostgreSQL`, en gardant le backend Node.js/Express.

## 1. Objectif

Passer de:

- Base actuelle: MongoDB (`MONGO_URI`)
- ORM actuelle: Mongoose

Vers:

- Base cible: PostgreSQL (dans Docker)
- ORM cible recommandee: Prisma (simple, type-safe, migrations SQL propres)

## 2. Pre-requis

- Node.js installe
- Docker Desktop installe
- Projet actuel qui tourne avec MongoDB
- Branche Git dediee (important pour rollback)

Commandes conseillees:

```bash
git checkout -b feat/mongo-to-postgres
```

## 3. Etape 1 - Sauvegarde et audit initial

Avant de toucher le code:

1. Exporter les donnees Mongo (backup)
2. Lister les collections/utilisations (User, Robot, etc.)
3. Verifier les relations implicites (ex: `user.robotAssigned`)

Exemple backup Mongo:

```bash
mongodump --uri="mongodb://127.0.0.1:27017/telepresence_db" --out ./backup-mongo
```

Pourquoi: migration sans backup = risque de perte de donnees.

## 4. Etape 2 - Demarrer PostgreSQL dans Docker

Ajouter un fichier `docker-compose.postgres.yml` a la racine:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16
    container_name: pfe_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: pfe_user
      POSTGRES_PASSWORD: pfe_password
      POSTGRES_DB: telepresence_db
    ports:
      - "55432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pfe_user -d telepresence_db"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Lancer Postgres:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Verifier:

```bash
docker ps
```

## 5. Etape 3 - Mettre a jour les variables d'environnement

Dans `backend/.env`, remplacer progressivement:

```env
# Ancien
MONGO_URI=mongodb://127.0.0.1:27017/telepresence_db

# Nouveau
DATABASE_URL="postgresql://pfe_user:pfe_password@localhost:55432/telepresence_db?schema=public"
JWT_SECRET="change-me-very-strong-secret"
PORT=5000
```

Important:

- Ne pas commiter de vrais secrets
- Ajouter un `backend/.env.example` sans valeurs sensibles

## 6. Etape 4 - Installer Prisma et retirer Mongoose

Dans `backend/`:

```bash
npm uninstall mongoose
npm install @prisma/client
npm install -D prisma
npx prisma init
```

Cela cree:

- `prisma/schema.prisma`
- configuration Prisma de base

## 7. Etape 5 - Modeliser les tables SQL

Exemple `backend/prisma/schema.prisma` adapte au projet:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Robot {
  id        String   @id @default(cuid())
  name      String
  robotId   String   @unique
  latitude  Float
  longitude Float
  status    RobotStatus @default(offline)
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  password        String
  role            UserRole @default(operator)
  robotAssignedId String?
  robotAssigned   Robot?   @relation(fields: [robotAssignedId], references: [id], onDelete: SetNull)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum UserRole {
  admin
  operator
}

enum RobotStatus {
  online
  offline
  maintenance
}
```

Pourquoi Prisma ici:

- migrations versionnees
- relations explicites
- requetes plus robustes

## 8. Etape 6 - Creer et appliquer la migration SQL

```bash
npx prisma migrate dev --name init_postgres
npx prisma generate
```

Verifier tables creees:

```bash
npx prisma studio
```

## 9. Etape 7 - Remplacer la couche acces donnees

### 9.1 Creer un client Prisma

Exemple `backend/src/config/prisma.js`:

```js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = prisma;
```

### 9.2 Modifier les controllers

Remplacer Mongoose:

- `User.findOne({ email })` -> `prisma.user.findUnique({ where: { email } })`
- `User.create(...)` -> `prisma.user.create({ data: ... })`
- `User.find()` -> `prisma.user.findMany(...)`
- `Robot.findByIdAndDelete(id)` -> `prisma.robot.delete({ where: { id } })`

### 9.3 Retirer les modeles Mongoose

- `backend/src/models/User.js`
- `backend/src/models/Robot.js`

Puis utiliser Prisma partout.

## 10. Etape 8 - Migrer les donnees Mongo vers Postgres

Approche recommandee:

1. Script Node de migration (lecture Mongo -> insertion Prisma)
2. Migrer d'abord `Robot`
3. Migrer ensuite `User` en re-resolvant `robotAssigned`

Pseudo workflow:

```text
Mongo robots -> table Robot
Mongo users  -> table User (map robotAssigned ObjectId => Robot.id SQL)
```

Verifier:

- nombre d'utilisateurs avant/apres
- nombre de robots avant/apres
- verif d'echantillons manuels

## 11. Etape 9 - Tests de regression

Verifier au minimum:

1. Login / register
2. CRUD users
3. CRUD robots
4. Role admin/operator
5. Endpoint de verification session (`/api/auth/me`)

## 12. Etape 10 - Nettoyage final

1. Supprimer `MONGO_URI` et code mort Mongo
2. Mettre a jour la doc de lancement
3. Ajouter scripts npm utiles:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

## 13. Plan de migration conseille (sans downtime)

1. Ajouter Postgres + Prisma
2. Faire tourner les 2 DB en parallele temporairement
3. Migrer les donnees
4. Basculer lecture/criture vers Postgres
5. Monitorer 24-48h
6. Retirer Mongo

## 14. Risques classiques a eviter

- Oublier le mapping des IDs entre Mongo et SQL
- Casser les relations `robotAssigned`
- Migrer sans backup
- Laisser des URLs hardcodees ou secrets en clair

## 15. Checklist rapide

- [ ] Backup Mongo fait
- [ ] Postgres Docker demarre
- [ ] `DATABASE_URL` configuree
- [ ] Prisma schema valide
- [ ] Migration SQL appliquee
- [ ] Controllers convertis
- [ ] Donnees migrees et validees
- [ ] Tests fonctionnels OK
- [ ] Nettoyage Mongo termine

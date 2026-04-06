# DATABASE_SCHEMA

## Prisma schema
Le schema Prisma est dans `backend/prisma/schema.prisma`.

### Table `users`
- `id` (uuid)
- `firstName`, `lastName`
- `email` (unique)
- `phone`
- `password` (hash)
- `role` (admin, user, operator)
- `robotId` (optionnel)
- `createdAt`, `updatedAt`

### Table `robots`
- `id` (cuid)
- `name`
- `robotId` (unique)
- `latitude`, `longitude`
- `status` (offline par defaut)
- `createdAt`, `updatedAt`

### Table `requests`
- `id` (cuid)
- `firstName`, `lastName`
- `email`, `phone`
- `password` (optionnel)
- `robotId` (utilise pour stocker le message de demande)
- `status` (pending par defaut)
- `createdAt`, `updatedAt`

## Exemple Prisma
```js
const users = await prisma.user.findMany({
  orderBy: { createdAt: "desc" },
});
```

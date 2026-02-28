# Seed test data

Ce dossier contient le seed pour les donnees de test:

- 1 compte admin
- 3 robots

## Lancer le seed

Depuis `backend/`:

```bash
npm run seed:test
```

## Valeurs par defaut

- Admin email: `admin@telebot.local`
- Admin password: `Admin123!`

## Override (optionnel)

Tu peux personnaliser via variables d'environnement:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Exemple:

```bash
SEED_ADMIN_EMAIL=admin@myapp.com SEED_ADMIN_PASSWORD=MyStrongPass123 npm run seed:test
```

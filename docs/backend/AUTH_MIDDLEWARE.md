# AUTH_MIDDLEWARE

## Middleware JWT
Fichier: `backend/src/middlewares/auth.middleware.js`

### protect
- Lit le header `Authorization: Bearer <token>`.
- Verifie le token avec `JWT_SECRET`.
- Place `req.user` (id + role).

Exemple:
```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

### adminOnly
- Refuse si `req.user.role !== "admin"`.

## Utilisation dans les routes
```js
router.get("/", protect, adminOnly, getUsers);
```

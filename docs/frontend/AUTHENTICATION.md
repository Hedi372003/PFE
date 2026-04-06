# AUTHENTICATION

## Connexion
- La page `Login` envoie les identifiants vers `/api/auth/login`.
- Le backend retourne un `token` et un `user`.
- Ces valeurs sont stockees dans `localStorage`.

```ts
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
```

## Verification de session
- Au chargement, `App.tsx` verifie le token via `/api/auth/me`.
- Si le token est invalide, il est supprime du stockage.

## Routes protegees
- `ProtectedRoute` bloque l acces si l utilisateur n est pas connecte.
- `AdminRoute` bloque l acces si le role n est pas `admin`.

## Deconnexion
- `AppLayout` supprime `token` et `user`, puis redirige vers `/login`.

## Usage du JWT
- Le token est ajoute dans les headers `Authorization: Bearer`.
- Il est utilise pour toutes les routes sensibles (users, robots, requests).

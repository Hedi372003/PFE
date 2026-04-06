# API_COMMUNICATION

## Axios
- Un client Axios est defini dans `src/api/axios.ts`.
- Il ajoute automatiquement le token JWT dans les headers.

```ts
const api = axios.create({ baseURL: "" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## Fetch
- Certaines pages utilisent `fetch` directement.
- Exemple: login et verification de session.

## Endpoints utilises
- Authentification: `/api/auth/login`, `/api/auth/me`.
- Utilisateurs: `/api/users`, `/api/users/:id`.
- Robots: `/api/robots`, `/api/robots/:id`.
- Demandes: `/api/requests`, `/api/requests/:id/approve`, `/api/requests/:id/reject`.
- WebSocket temps reel: `ws://localhost:5002`.

## Gestion des erreurs
- Les erreurs Axios sont capturees avec `AxiosError`.
- Un message simple est affiche a l utilisateur.

Exemple:
```ts
try {
  await api.post("/api/robots", payload);
} catch (err) {
  if (err instanceof AxiosError) {
    setError(err.response?.data?.message || "Failed to add robot.");
  }
}
```

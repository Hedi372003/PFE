# FRONTEND_OVERVIEW

## Cadre general
- Le frontend est une application React avec TypeScript, construite avec Vite.
- Il fournit l interface utilisateur pour gerer les robots, les utilisateurs et les demandes.

## Technologies principales
- React 19 + TypeScript pour la logique et la typage.
- React Router pour la navigation des pages.
- Axios et Fetch pour les appels API.
- Tailwind CSS pour le style.
- Framer Motion pour les animations.
- Lucide React pour les icones.
- Radix UI (via composants internes) pour les elements UI de base.

## Objectif du frontend
- Donner une interface claire pour les administrateurs et les operateurs.
- Permettre la gestion des utilisateurs, des robots et des demandes.
- Offrir un panneau de controle temps reel pour les robots.

## Communication avec le backend
- Les routes API utilisent le prefixe `/api`.
- Vite redirige `/api` vers `http://localhost:5000` (proxy).
- Un token JWT est stocke dans `localStorage` et ajoute aux requetes.

Exemple d appel via Axios:
```ts
import api from "@/api/axios";

const { data } = await api.get("/api/users");
```

Exemple d appel via Fetch:
```ts
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

# STATE_AND_LOGIC

## Hooks utilises
- `useState` pour gerer les donnees locales (formulaires, loading, messages).
- `useEffect` pour charger les donnees depuis l API au chargement.
- `useMemo` pour optimiser les listes filtrees ou les donnees derivees.
- `useRef` pour les references WebRTC et WebSocket (RobotControl).

## Gestion des donnees
- Les pages chargent les listes via `api.get` puis stockent les resultats dans le state.
- Exemple: `UsersPage` charge `/api/users` puis filtre selon la recherche.

## Formulaires
- Les champs sont controles (valeur + onChange).
- Validation simple avant envoi (ex: champs obligatoires, mot de passe).
- Messages d erreur et de succes affiches dans l interface.

Exemple de validation:
```ts
if (!form.email.trim()) return "Email is required.";
```

## Chargement et feedback
- Indicateurs `loading` pour afficher un etat de chargement.
- Messages temporaires pour confirmer une action.
- Modals de confirmation pour suppression (UsersPage, AdminDashboard).

## Logique speciale
- `RobotControl` utilise WebSocket + WebRTC pour video et commandes.
- `Settings` stocke les preferences dans `localStorage` et change le theme.

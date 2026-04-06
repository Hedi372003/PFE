# PROJECT_STRUCTURE

## Vue generale des dossiers
Arborescence principale du frontend:
```text
frontend/
  index.html
  package.json
  tailwind.config.js
  vite.config.js
  src/
    main.tsx
    App.tsx
    App.css
    index.css
    api/
      axios.ts
      users.api.ts
    assets/
      react.svg
    components/
      layout/
        AppLayout.tsx
        PublicNavbar.tsx
        NotificationDropdown.tsx
      ui/
        button.tsx
        input.tsx
        select.tsx
        dialog.tsx
        ...
      NavLink.tsx
      UserForm.tsx
      UserTable.tsx
    lib/
      utils.ts
    pages/
      Home.tsx
      Login.tsx
      AdminDashboard.tsx
      UsersPage.tsx
      AddUser.tsx
      EditUser.tsx
      RobotsPage.tsx
      AddRobot.tsx
      Requests.tsx
      RobotControl.tsx
      Settings.tsx
      OperatorDashboard.tsx
      operateur/OperatorDashboard.tsx
    types/
      auth.ts
```

## Role de chaque dossier
- `src/` contient tout le code React.
- `src/pages/` contient les pages principales affichees par le routeur.
- `src/components/` regroupe les composants reutilisables.
- `src/components/layout/` contient la structure globale (sidebar, topbar, navbar publique).
- `src/components/ui/` contient les composants UI bas niveau (boutons, inputs, modals, etc.).
- `src/api/` centralise la logique d acces aux API.
- `src/types/` declare les types TypeScript partages.
- `src/lib/` fournit des utilitaires communs.

## Pourquoi cette architecture
- Separation claire entre pages, layout et UI reutilisable.
- Facilite la maintenance et l ajout de nouvelles pages.
- Permet de garder les appels API et les types en un seul endroit.
- Compatible avec un projet PFE: structure simple, lisible, et presentable.

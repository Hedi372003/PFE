# PAGES

## Liste des pages et roles
- `/` `Home.tsx`: page publique avec hero, fonctionnalites et formulaire de reservation.
- `/login` `Login.tsx`: connexion utilisateur, sauvegarde du token.
- `/admin` `AdminDashboard.tsx`: tableau de bord admin avec stats et liste utilisateurs.
- `/users` `UsersPage.tsx`: liste utilisateurs, recherche, suppression.
- `/users/add` `AddUser.tsx`: creation utilisateur, possible depuis une demande.
- `/users/edit/:id` `EditUser.tsx`: modification d un utilisateur.
- `/robots` `RobotsPage.tsx`: liste des robots, suppression.
- `/robots/add` `AddRobot.tsx`: ajout d un robot.
- `/requests` `Requests.tsx`: liste des demandes en attente, approuver/refuser.
- `/settings` `Settings.tsx`: profil, notifications, theme.
- `/robot-control` `RobotControl.tsx`: controle temps reel, video WebRTC.
- `/operator` `pages/operateur/OperatorDashboard.tsx`: dashboard operateur (liste robots et acces controle).

## Pages annexes ou legacy
- `pages/OperatorDashboard.tsx`: page simple, semble remplacee par `pages/operateur/OperatorDashboard.tsx`.
- `UserManagementPage.tsx`: page de test/legacy pour afficher les utilisateurs.

## Comment fonctionne le routage
- Le routage est centralise dans `src/App.tsx` avec `react-router-dom`.
- Des routes protegees existent:
- `AdminRoute` exige un utilisateur admin.
- `ProtectedRoute` exige un utilisateur connecte.

Extrait simplifie:
```tsx
<Route path="/admin" element={<AdminRoute user={user}><AdminDashboard /></AdminRoute>} />
```

# CONTROLLERS_LOGIC

## Auth Controller
Fichier: `src/controllers/auth.controller.js`
- `register` valide les champs, hash le mot de passe, cree l utilisateur.
- `login` verifie email + mot de passe, genere un JWT.
- `me` retourne les infos du user courant.

Exemple JWT:
```js
const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
```

## User Controller
Fichier: `src/controllers/user.controller.js`
- `createUser` valide et cree un utilisateur.
- `getUsers` liste les utilisateurs.
- `getUserById` details par id.
- `updateUser` modifie les champs fournis.
- `deleteUser` supprime un utilisateur.

Exemple update:
```js
if (password) data.password = await bcrypt.hash(password, 10);
```

## Robot Controller
Fichier: `src/controllers/robot.controller.js`
- `getAllRobots` liste tous les robots.
- `createRobot` cree un robot avec status par defaut.
- `updateRobot` met a jour (nom, status, coords).
- `deleteRobot` supprime un robot.

## Request Controller
Fichier: `src/controllers/request.controller.js`
- `createRequest` cree une demande (status pending).
- `getPendingRequests` liste les demandes pending.
- `approveRequest` change le status en approved.
- `rejectRequest` change le status en rejected.

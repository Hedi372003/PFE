# PROJECT_STRUCTURE_BACKEND

## Arborescence
```text
backend/
  server.js
  signaling-server.js
  package.json
  prisma.config.ts
  .env.example
  prisma/
    schema.prisma
    seed/
  src/
    app.js
    config/
      prisma.js
    controllers/
      auth.controller.js
      user.controller.js
      robot.controller.js
      request.controller.js
      cms.controller.js
      notification.controller.js
      call.controller.js
    middlewares/
      auth.middleware.js
    realtime/
      realtime-hub.js
    routes/
      auth.routes.js
      user.routes.js
      robot.routes.js
      request.routes.js
      cms.routes.js
      notification.routes.js
      call.routes.js
    services/
      robot.service.js
      company.service.js
      notification.service.js
      call.service.js
```

## Role des dossiers
- `server.js`: point d entree HTTP principal, attache Express et le hub temps reel.
- `signaling-server.js`: lance uniquement le serveur signaling standalone.
- `src/app.js`: middleware Express, CORS, JSON et routing API.
- `src/config/prisma.js`: client Prisma PostgreSQL.
- `src/controllers/`: orchestration HTTP par domaine.
- `src/routes/`: definition des endpoints REST.
- `src/services/`: logique partagee, persistence robots, CMS, notifications, appels.
- `src/realtime/realtime-hub.js`: hub WebSocket pour notifications, signaling, chat, commandes et presence.
- `prisma/schema.prisma`: modele de donnees central pour les entites Prisma.
- `prisma/seed/`: seed d administration et robots.

## Modeles de donnees principaux
- `CompanyProfile`: contenu CMS entreprise persistant.
- `Notification`: notification stockee et diffusable en temps reel.
- `NotificationReadReceipt`: suivi des notifications lues.
- `CallSession`: session audio/video avec room WebRTC.
- `CallMessage`: messages de chat persistants.
- `User`, `Request`: domaines Prisma existants conserves et enrichis.

## Note sur les robots
- les endpoints `/api/robots` utilisent `backend/src/services/robot.service.js`
- la persistence robot passe par SQL direct PostgreSQL pour correspondre exactement a la table existante
- cela evite les erreurs de mapping Prisma sur la table `robots`

## Pourquoi cette organisation
- separation nette entre REST, realtime et persistence
- compatibilite avec le frontend admin telepresence
- architecture plus claire pour un PFE et une soutenance
- extension simple vers audit logs, analytics ou monitoring plus tard

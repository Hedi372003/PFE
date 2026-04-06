# WEBSOCKET_SIGNALING

## Vue d ensemble
Le backend utilise maintenant un hub temps reel unique dans `backend/src/realtime/realtime-hub.js`.

Ce hub gere:
- les notifications live
- le signaling WebRTC multi-room
- le chat de session
- les commandes robot
- les statuts de session d appel

## Endpoints WebSocket
- WebSocket integre HTTP: `ws://localhost:5000/ws`
- WebSocket standalone compatible legacy: `ws://localhost:5002`

Variables d environnement:
- `WS_PATH`
- `SIGNALING_PORT`
- `SIGNALING_HOST`

## Authentification
Deux options:
- query param: `ws://localhost:5000/ws?token=JWT`
- message:

```json
{ "type": "authenticate", "token": "JWT" }
```

## Messages supportes

### Presence
```json
{ "type": "join-room", "roomId": "call-123", "participantType": "operator" }
```

```json
{ "type": "leave-room", "roomId": "call-123" }
```

### Legacy compatibility
```json
{ "type": "operator" }
```

```json
{ "type": "robot" }
```

Sans `roomId`, le hub utilise la room legacy `legacy-telepresence`.

### WebRTC signaling
```json
{ "type": "offer", "roomId": "call-123", "offer": { "type": "offer", "sdp": "..." } }
```

```json
{ "type": "answer", "roomId": "call-123", "answer": { "type": "answer", "sdp": "..." } }
```

```json
{ "type": "candidate", "roomId": "call-123", "candidate": { "candidate": "..." } }
```

Optionnel:
- `targetConnectionId` pour cibler un pair specifique

### Robot commands
```json
{ "type": "command", "roomId": "call-123", "command": "forward" }
```

### Chat
```json
{ "type": "chat", "roomId": "call-123", "message": "Can you hear me?" }
```

Le message est persiste en base si une `CallSession` existe pour cette room.

### Call status
```json
{ "type": "call.start", "roomId": "call-123" }
```

```json
{ "type": "call.end", "roomId": "call-123" }
```

### Notifications
Le serveur envoie:
```json
{
  "type": "notification",
  "id": "notif-id",
  "title": "Robot updated",
  "body": "Robot R-204 configuration was updated.",
  "kind": "robot",
  "priority": "info",
  "targetRole": "admin"
}
```

## Evenements serveur emis
- `connected`
- `auth.success`
- `auth.error`
- `room.joined`
- `room.left`
- `peer.joined`
- `peer.left`
- `call.session`
- `call.status`
- `chat`
- `notification`
- `error`

## Comportement des sessions
- quand au moins 2 pairs rejoignent une room connue, la `CallSession` passe en `live`
- quand une session est terminee via REST ou WebSocket, un evenement `call.status` est diffuse
- les messages de chat sont sauvegardes dans `call_messages`

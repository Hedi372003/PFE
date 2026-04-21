# Notification System Etape

## Objective

This stage fixes the notification flow so the frontend shows real notifications coming from the backend database and realtime server instead of locally generated demo alerts.

## Problem Before The Fix

- The frontend notification store was seeded with hardcoded sample notifications.
- Notifications were persisted in `localStorage`, so the UI could show stale or fake alerts unrelated to backend activity.
- When the WebSocket failed, the client started a timed mock stream that kept generating artificial notifications.
- The communication page could also inject local-only notifications that were never stored on the backend.

## What Changed

### Frontend

- `frontend/src/services/websocket.ts`
  - Removed hardcoded default notifications.
  - Removed `localStorage` notification persistence.
  - Removed the mock notification interval and all fake notification generation.
  - Added initial synchronization from the real `/api/notifications` endpoint.
  - Added authenticated realtime subscription using the stored JWT token.
  - Added real `mark as read` and `mark all as read` calls through the backend API.
  - Kept live updates by merging backend WebSocket `notification` events into the in-memory state.

- `frontend/src/services/api.ts`
  - Added a dedicated `notificationService` with:
    - `list()`
    - `markAsRead()`
    - `markAllAsRead()`

- `frontend/src/hooks/useSocket.ts`
  - Kept the shared notification hook, but it now returns backend-backed notifications instead of generated ones.

- `frontend/src/components/notifications/NotificationDropdown.tsx`
  - Updated click handlers to work with async backend read actions.
  - Removed the obsolete `mock` connection state from the UI mapping.

- `frontend/src/pages/Dashboard.tsx`
  - Updated the unread alert helper text to reflect the real database-backed notification flow.

- `frontend/src/pages/Communication.tsx`
  - Removed local notification injection so this page no longer generates fake alerts in the interface.

- `frontend/src/types/notification.ts`
  - Extended the notification type with optional `updatedAt` and `readAt`.
  - Removed the old `mock` socket status.

### Backend

- The backend notification API and realtime hub were already capable of serving real notifications.
- No route redesign was required.
- The frontend now correctly consumes:
  - `GET /api/notifications`
  - `POST /api/notifications/:id/read`
  - `POST /api/notifications/read-all`
  - realtime `notification` WebSocket events from `/ws`

## Result

- Dashboard notification preview now shows real backend notifications.
- The notification dropdown now reflects actual read and unread state stored on the server.
- Refreshing the page no longer restores fake demo alerts from local storage.
- If the realtime channel disconnects, the app keeps the last real notifications instead of inventing new ones.

## Verification

- Frontend production build completed successfully with `npm run build`.
- Backend notification-related modules were loaded successfully with a Node import check.

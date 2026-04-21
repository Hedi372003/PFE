import { useMemo } from "react";

import { useSocket } from "@/hooks/useSocket";

export type NotificationBadgeKey = "requests" | "robots" | "communication" | "logs";

export function useNotificationBadges() {
  const socket = useSocket();

  const unreadByKind = useMemo(
    () =>
      socket.notifications.reduce(
        (counts, notification) => {
          if (!notification.read) {
            counts[notification.kind] += 1;
          }

          return counts;
        },
        {
          visitor: 0,
          robot: 0,
          communication: 0,
          system: 0,
        },
      ),
    [socket.notifications],
  );

  const badgeState = useMemo(
    () => ({
      requests: unreadByKind.visitor > 0,
      robots: unreadByKind.robot > 0,
      communication: unreadByKind.communication > 0,
      logs: socket.unreadCount > 0,
    }),
    [socket.unreadCount, unreadByKind.communication, unreadByKind.robot, unreadByKind.visitor],
  );

  return {
    ...socket,
    badgeState,
    unreadByKind,
  };
}

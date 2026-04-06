import { useEffect, useState } from "react";

import { websocketService } from "@/services/websocket";
import type { SocketSnapshot } from "@/types/notification";

export function useSocket() {
  const [snapshot, setSnapshot] = useState<SocketSnapshot>(websocketService.getSnapshot());

  useEffect(() => {
    const releaseConnection = websocketService.connect();
    const unsubscribe = websocketService.subscribe(setSnapshot);

    return () => {
      unsubscribe();
      releaseConnection();
    };
  }, []);

  return {
    ...snapshot,
    unreadCount: snapshot.notifications.filter((notification) => !notification.read).length,
    markAsRead: (id: string) => websocketService.markAsRead(id),
    markAllAsRead: () => websocketService.markAllAsRead(),
    pushNotification: websocketService.pushNotification.bind(websocketService),
    sendSocketMessage: websocketService.send.bind(websocketService),
  };
}

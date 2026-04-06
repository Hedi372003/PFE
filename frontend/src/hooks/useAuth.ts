import { useEffect, useState } from "react";

import { authService } from "@/services/api";
import type { AuthUser } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const token = authService.getStoredToken();

      if (!token) {
        if (isMounted) {
          setLoading(false);
          setUser(null);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();

        if (isMounted) {
          authService.setStoredUser(currentUser);
          setUser(currentUser);
        }
      } catch {
        authService.clearSession();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeLogin = (token: string, authenticatedUser: AuthUser) => {
    authService.setSession(token, authenticatedUser);
    setUser(authenticatedUser);
  };

  return {
    user,
    loading,
    completeLogin,
  };
}

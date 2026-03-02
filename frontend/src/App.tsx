import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import type { AuthUser } from "./types/auth";

const DashboardRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/admin${location.search}`} replace />;
};

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Invalid token");
        }

        const data = (await res.json()) as AuthUser;
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, []);

  const handleLogin = (loggedUser: AuthUser): void => {
    setUser(loggedUser);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/operator"}
                replace
              />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard onLogout={handleLogout} user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user?.role === "admin" ? (
              <DashboardRedirect />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/users/add"
          element={
            user?.role === "admin" ? (
              <AddUser />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            user?.role === "admin" ? (
              <EditUser />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/operator"
          element={
            user && user.role !== "admin" ? (
              <OperatorDashboard onLogout={handleLogout} user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

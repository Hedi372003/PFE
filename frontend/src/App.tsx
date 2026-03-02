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
import RobotControl from "./pages/RobotControl";
import UsersPage from "./pages/UsersPage";
import RobotsPage from "./pages/RobotsPage";
import AddRobot from "./pages/AddRobot"; // ⚠️ IMPORTANT

import type { AuthUser } from "./types/auth";

/* =============================
   Redirect component
============================= */
const DashboardRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/admin${location.search}`} replace />;
};

/* =============================
   Protected Route Wrapper
============================= */
const ProtectedRoute = ({
  user,
  children,
}: {
  user: AuthUser | null;
  children: JSX.Element;
}) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/* =============================
   Admin Only Route
============================= */
const AdminRoute = ({
  user,
  children,
}: {
  user: AuthUser | null;
  children: JSX.Element;
}) => {
  if (!user || user.role !== "admin")
    return <Navigate to="/login" replace />;
  return children;
};

/* =============================
   Main App Component
============================= */
const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* =============================
     Check Auth On App Load
  ============================= */
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

        if (!res.ok) throw new Error("Invalid token");

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

  /* =============================
     Handlers
  ============================= */
  const handleLogin = (loggedUser: AuthUser): void => {
    setUser(loggedUser);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  /* =============================
     Loading Screen
  ============================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  /* =============================
     Routes
  ============================= */
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Login */}
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

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminDashboard onLogout={handleLogout} user={user!} />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute user={user}>
              <UsersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/users/add"
          element={
            <AdminRoute user={user}>
              <AddUser />
            </AdminRoute>
          }
        />

        <Route
          path="/users/edit/:id"
          element={
            <AdminRoute user={user}>
              <EditUser />
            </AdminRoute>
          }
        />

        {/* Robots list */}
        <Route
          path="/robots"
          element={
            <AdminRoute user={user}>
              <RobotsPage />
            </AdminRoute>
          }
        />

        {/* Add Robot ✅ */}
        <Route
          path="/robots/add"
          element={
            <AdminRoute user={user}>
              <AddRobot />
            </AdminRoute>
          }
        />

        {/* ================= SHARED ROUTES ================= */}

        <Route
          path="/robot-control"
          element={
            <ProtectedRoute user={user}>
              <RobotControl />
            </ProtectedRoute>
          }
        />

        {/* ================= OPERATOR ROUTES ================= */}

        <Route
          path="/operator"
          element={
            user && user.role !== "admin" ? (
              <OperatorDashboard
                onLogout={handleLogout}
                user={user}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Dashboard redirect */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
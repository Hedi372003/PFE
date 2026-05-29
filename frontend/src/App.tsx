import { type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import AddRobot from "@/pages/AddRobot";
import AddUser from "@/pages/AddUser";
import Communication from "@/pages/Communication";
import CompanyCMS from "@/pages/CompanyCMS";
import Dashboard from "@/pages/Dashboard";
import EditUser from "@/pages/EditUser";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Logs from "@/pages/Logs";
import Requests from "@/pages/Requests";
import RobotControl from "@/pages/RobotControl";
import Robots from "@/pages/Robots";
import Settings from "@/pages/Settings";
import UsersPage from "@/pages/Visitors";
import type { AuthUser } from "@/types/auth";

function ProtectedRoute({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactElement;
}) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactElement;
}) {
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const App: React.FC = () => {
  const { user, loading, completeLogin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-muted-foreground">Loading administration workspace...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />   
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin" : "/operator"} replace />
            ) : (
              <Login onLogin={completeLogin} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <Dashboard />
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

        <Route
          path="/robots"
          element={
            <ProtectedRoute user={user}>
              <Robots />
            </ProtectedRoute>
          }
        />

        <Route
          path="/robots/add"
          element={
            <AdminRoute user={user}>
              <AddRobot />
            </AdminRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <AdminRoute user={user}>
              <Requests />
            </AdminRoute>
          }
        />

        <Route
          path="/communication"
          element={
            <ProtectedRoute user={user}>
              <Communication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company-cms"
          element={
            <AdminRoute user={user}>
              <CompanyCMS />
            </AdminRoute>
          }
        />

        <Route
          path="/cms"
          element={<Navigate to="/company-cms" replace />}
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute user={user}>
              <Logs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/robot-control"
          element={
            <ProtectedRoute user={user}>
              <RobotControl />
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator"
          element={
            user && user.role !== "admin" ? (
              <Dashboard />
            ) : (
              <Navigate to={user ? "/admin" : "/login"} replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin" : "/operator"} replace />
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

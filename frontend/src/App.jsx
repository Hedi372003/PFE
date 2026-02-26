import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔎 Vérification du token au démarrage
  useEffect(() => {
    const checkAuth = async () => {
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

        const data = await res.json();
        setUser(data);

      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // 🔄 Évite le flicker
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // 🔐 Si non connecté → Login
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 🔥 Role-based rendering sécurisé
  if (user.role === "admin") {
    return <AdminDashboard onLogout={handleLogout} user={user} />;
  }

  return <OperatorDashboard onLogout={handleLogout} user={user} />;
}

export default App;
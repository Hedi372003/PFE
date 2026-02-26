import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Si serveur down
      if (!res) {
        throw new Error("Server not reachable");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 🔥 Nettoyage avant stockage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔐 Stockage sécurisé
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🚀 Envoie user au App
      onLogin(data.user);

    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">🤖</span>
          <h1 className="text-2xl font-bold text-gray-800">TeleBot</h1>
        </div>

        {/* Welcome */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to securely access the telepresence robot
            management platform. Your session is encrypted and protected.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition duration-200
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1e2a4a] hover:bg-[#16203a]"
              }
            `}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}
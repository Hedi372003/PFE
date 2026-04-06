import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, getApiErrorMessage } from "@/services/api";
import type { AuthUser } from "@/types/auth";

interface LoginProps {
  onLogin: (token: string, user: AuthUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authService.login({ email, password });
      onLogin(data.token, data.user);
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-subtle flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="card-elevated p-8">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <Bot className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-foreground">TeleBot</span>
          </Link>

          <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">Admin Sign In</h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Access the telepresence administration workspace for visitor management, communication,
            robot supervision, and company content control.
          </p>

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Secure password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Tip: use the admin account seeded in the backend to access the full administration shell.
            </p>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

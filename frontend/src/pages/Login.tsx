import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthUser } from "@/types/auth";

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
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

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Server error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card-elevated p-8">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <Bot className="h-8 w-8 text-accent" />
            <span className="font-bold text-2xl text-foreground">TeleBot</span>
          </Link>

          <h1 className="text-xl font-semibold text-center text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sign in to securely access the telepresence robot management platform.
            Your session is encrypted and protected.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground btn-transition"
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/create-password" className="text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full btn-transition" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

interface AddUserFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  robotId: string;
}

interface ApiErrorResponse {
  message?: string;
}

const initialForm: AddUserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  robotId: "",
};

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AddUserFormState>(initialForm);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const setField = <K extends keyof AddUserFormState>(
    key: K,
    value: AddUserFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.password.trim()) return "Password is required.";
    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/users", {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        robotAssigned: form.robotId.trim() || null,
      });

      setSuccess("User created successfully.");
      window.setTimeout(() => {
        navigate("/dashboard?created=1", { replace: true });
      }, 700);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiMessage = (err.response?.data as ApiErrorResponse | undefined)
          ?.message;
        setError(apiMessage || "Failed to create user.");
      } else {
        setError("Failed to create user.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-2xl"
      >
        <h1 className="mb-2 text-2xl font-bold text-foreground">Add User</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Create a new user account, assign contact details, and optionally link
          a robot for operations.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("firstName", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("lastName", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("email", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("phone", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("password", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="robotId">Robot ID (Optional)</Label>
              <Input
                id="robotId"
                value={form.robotId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("robotId", e.target.value)
                }
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
              >
                {loading ? "Creating user..." : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default AddUser;

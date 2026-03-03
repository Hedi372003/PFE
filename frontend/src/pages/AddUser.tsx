import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

interface PrefilledFromRequest {
  requestId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface LocationState {
  fromRequest?: PrefilledFromRequest;
}

interface ApiErrorResponse {
  message?: string;
}

const emptyForm: AddUserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  robotId: "",
};

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) || null;

  const prefilled = useMemo(() => state?.fromRequest || null, [state]);
  const [form, setForm] = useState<AddUserFormState>({
    ...emptyForm,
    ...(prefilled
      ? {
          firstName: prefilled.firstName,
          lastName: prefilled.lastName,
          email: prefilled.email,
          phone: prefilled.phone,
          password: prefilled.password,
        }
      : {}),
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const setField = <K extends keyof AddUserFormState>(key: K, value: AddUserFormState[K]) => {
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

  const getApiError = (err: unknown, fallback: string): string => {
    if (err instanceof AxiosError) {
      const apiMessage = (err.response?.data as ApiErrorResponse | undefined)?.message;
      return apiMessage || fallback;
    }
    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/users", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        robotId: form.robotId.trim() || null,
      });

      if (prefilled?.requestId) {
        await api.put(`/api/requests/${prefilled.requestId}/approve`);
      }

      navigate("/users", {
        replace: true,
        state: {
          toast: "User created successfully.",
        },
      });
    } catch (err: unknown) {
      setError(getApiError(err, "Failed to create user."));
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
        <div className="mb-2 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Add User</h1>
          {prefilled && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              From request
            </span>
          )}
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Create a new user account, assign contact details, and optionally link a robot for operations.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("firstName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("lastName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("phone", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("password", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="robotId">Robot ID (Optional)</Label>
              <Input
                id="robotId"
                value={form.robotId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("robotId", e.target.value)}
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

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

interface EditUserParams {
  id: string;
}

interface UserApiResponse {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  robotAssigned?: {
    id?: string;
    robotId?: string;
  } | null;
}

interface EditUserFormState {
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

const initialForm: EditUserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  robotId: "",
};

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<keyof EditUserParams>() as EditUserParams;

  const [form, setForm] = useState<EditUserFormState>(initialForm);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const userId = useMemo(() => id, [id]);

  const setField = <K extends keyof EditUserFormState>(
    key: K,
    value: EditUserFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get<UserApiResponse>(`/api/users/${userId}`);
        const fullName = data.name?.trim() || "";
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");

        setForm({
          firstName: firstName || "",
          lastName: lastName || "",
          email: data.email || "",
          phone: "",
          password: "",
          robotId: data.robotAssigned?.robotId || "",
        });
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          const apiMessage = (err.response?.data as ApiErrorResponse | undefined)
            ?.message;
          setError(apiMessage || "Failed to load user.");
        } else {
          setError("Failed to load user.");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [userId]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, string | null> = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        robotAssigned: form.robotId.trim() || null,
        phone: form.phone.trim(),
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await api.put(`/api/users/${userId}`, payload);
      setSuccess("User updated successfully.");
      window.setTimeout(() => {
        navigate("/dashboard?updated=1", { replace: true });
      }, 700);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiMessage = (err.response?.data as ApiErrorResponse | undefined)
          ?.message;
        setError(apiMessage || "Failed to update user.");
      } else {
        setError("Failed to update user.");
      }
    } finally {
      setSaving(false);
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
        <h1 className="mb-2 text-2xl font-bold text-foreground">Edit User</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Update user profile and robot assignment. Leave password empty to keep
          the current password unchanged.
        </p>

        {loading ? (
          <div className="card-elevated p-6 text-sm text-muted-foreground">
            Loading user details...
          </div>
        ) : (
          <>
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
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
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
                  <Input id="email" value={form.email} disabled />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("phone", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="robotId">Robot ID</Label>
                  <Input
                    id="robotId"
                    value={form.robotId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("robotId", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="password">New Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("password", e.target.value)
                    }
                    placeholder="Leave empty to keep current password"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                  >
                    {saving ? "Saving changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default EditUser;

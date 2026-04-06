import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage, logService, userService } from "@/services/api";
import type { UserUpdateInput } from "@/types/user";

interface EditUserParams {
  id: string;
}

type EditUserForm = Required<Pick<UserUpdateInput, "firstName" | "lastName" | "email" | "phone">> & {
  password: string;
  robotId: string;
};

const initialForm: EditUserForm = {
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

  const [form, setForm] = useState<EditUserForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = <K extends keyof EditUserForm>(key: K, value: EditUserForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      setLoading(true);
      setError("");

      try {
        const user = await userService.getById(id);

        if (!active) {
          return;
        }

        setForm({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          password: "",
          robotId: user.robotId || "",
        });
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, "Failed to load the visitor profile."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updatedUser = await userService.update(id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim() || undefined,
        robotId: form.robotId.trim() || null,
      });

      logService.record({
        category: "visit",
        severity: "success",
        actor: "Admin",
        title: "Visitor updated",
        description: `${updatedUser.firstName} ${updatedUser.lastName} was updated from the admin app.`,
      });

      navigate("/users?updated=1", { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Failed to update the visitor profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Edit Visitor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update visitor details and robot assignment while keeping the current admin flow simple.
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="card-elevated p-6 text-sm text-muted-foreground">Loading visitor details...</div>
        ) : (
          <div className="card-elevated p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotId">Robot ID</Label>
                <Input id="robotId" value={form.robotId} onChange={(event) => setField("robotId", event.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  placeholder="Leave empty to keep the current password"
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default EditUser;

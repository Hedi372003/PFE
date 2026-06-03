import { ClipboardPen, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage, logService, userService } from "@/services/api";
import type { UserUpdateInput } from "@/types/user";

interface EditUserParams {
  id: string;
}

type EditUserForm = Required<Pick<UserUpdateInput, "firstName" | "lastName" | "email" | "phone">>;

const initialForm: EditUserForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
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
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="card-elevated p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Edit Visitor</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Update visitor identity and contact details without exposing access credentials in
                the admin form.
              </p>
            </div>

            <div className="rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              Password changes are no longer managed from this screen.
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="card-elevated p-6 text-sm text-muted-foreground">Loading visitor details...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <section className="card-elevated p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">Visitor profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Keep the visitor record current so communication history and follow-up workflows
                    remain accurate across the admin workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(event) => setField("firstName", event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(event) => setField("lastName", event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setField("email", event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(event) => setField("phone", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
                  <Link to="/users">
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </section>

            <aside className="space-y-4">
              <div className="card-elevated p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <ClipboardPen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Editing scope</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This screen focuses only on visitor profile and contact data so the edit flow
                      stays lightweight for admin staff.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Credential handling</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Passwords are intentionally excluded from visitor editing here. That keeps routine
                      profile maintenance separate from credential administration.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default EditUser;

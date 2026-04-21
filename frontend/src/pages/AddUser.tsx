import { ClipboardCheck, Cpu, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage, logService, requestService, userService } from "@/services/api";
import type { UserDraft } from "@/types/user";

interface PrefilledFromRequest {
  requestId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface LocationState {
  fromRequest?: PrefilledFromRequest;
}

const emptyForm: UserDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  robotId: "",
};

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) || null;

  const prefilled = useMemo(() => state?.fromRequest || null, [state]);
  const [form, setForm] = useState<UserDraft>({
    ...emptyForm,
    ...(prefilled
      ? {
          firstName: prefilled.firstName,
          lastName: prefilled.lastName,
          email: prefilled.email,
          phone: prefilled.phone,
        }
      : {}),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const createdUser = await userService.create({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        robotId: form.robotId.trim(),
      });

      if (prefilled?.requestId) {
        await requestService.approve(prefilled.requestId);
      }

      logService.record({
        category: "visit",
        severity: "success",
        actor: "Admin",
        title: "Visitor created",
        description: `${createdUser.firstName} ${createdUser.lastName} was added to visitor management.`,
      });

      navigate("/users?created=1", { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Failed to create the visitor profile."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="card-elevated p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Add Visitor</h1>
                {prefilled ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    From request
                  </span>
                ) : null}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Create an approved visitor profile, keep contact details clean, and optionally connect
                the visitor to a robot before the telepresence session begins.
              </p>
            </div>

            <div className="rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              Access credentials are generated automatically.
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <section className="card-elevated p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Visitor details</h2>
                <p className="text-sm text-muted-foreground">
                  Capture the visitor identity and contact information that will appear across the
                  admin workspace.
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

              <div className="rounded-3xl border border-border/70 bg-slate-50 p-5">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Robot assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Attach a robot now if the visit has already been planned, or leave it empty and
                    assign one later from visitor management.
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="robotId">Robot ID</Label>
                  <Input
                    id="robotId"
                    value={form.robotId}
                    onChange={(event) => setField("robotId", event.target.value)}
                    placeholder="Optional robot assignment"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
                <Link to="/users">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={loading}>
                  <UserRoundPlus className="h-4 w-4" />
                  {loading ? "Creating visitor..." : "Create Visitor"}
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="card-elevated p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">What happens next</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The visitor profile becomes available immediately in the management list, where it
                    can be edited, assigned, or removed later.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {prefilled ? "Request imported" : "Credential handling"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {prefilled
                      ? "This profile is prefilled from a pending visitor request. Approving creation will also close that request."
                      : "No manual password is required here. The platform now handles visitor access credentials behind the scenes."}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddUser;

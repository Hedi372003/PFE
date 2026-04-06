import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  password: string;
}

interface LocationState {
  fromRequest?: PrefilledFromRequest;
}

const emptyForm: UserDraft = {
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
  const [form, setForm] = useState<UserDraft>({
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Add Visitor</h1>
            {prefilled ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                From request
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an approved visitor profile and optionally assign a robot before the session starts.
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

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
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => setField("password", event.target.value)} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="robotId">Robot ID</Label>
              <Input
                id="robotId"
                value={form.robotId}
                onChange={(event) => setField("robotId", event.target.value)}
                placeholder="Optional robot assignment"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating visitor..." : "Create Visitor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddUser;

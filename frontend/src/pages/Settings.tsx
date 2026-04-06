import { useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, getApiErrorMessage, logService, userService } from "@/services/api";

type NotificationPrefs = {
  emailAlerts: boolean;
  systemUpdates: boolean;
  robotStatus: boolean;
};

const defaultNotifications: NotificationPrefs = {
  emailAlerts: true,
  systemUpdates: true,
  robotStatus: true,
};

const Settings: React.FC = () => {
  const storedUser = useMemo(() => authService.getStoredUser(), []);
  const canEditProfile = storedUser?.role === "admin" && Boolean(storedUser.id);

  const [firstName, setFirstName] = useState(storedUser?.firstName || "");
  const [lastName, setLastName] = useState(storedUser?.lastName || "");
  const [email, setEmail] = useState(storedUser?.email || "");
  const [phone, setPhone] = useState(storedUser?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState<NotificationPrefs>(defaultNotifications);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    const savedNotifications = localStorage.getItem("settings.notifications");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications) as NotificationPrefs);
      } catch {
        setNotifications(defaultNotifications);
      }
    }
  }, []);

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!canEditProfile || !storedUser?.id) {
      setError("Profile editing is currently available for admin accounts only.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await userService.update(storedUser.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim() || undefined,
      });

      authService.setStoredUser({
        ...storedUser,
        ...updatedUser,
        id: updatedUser.id,
        name: updatedUser.name,
      });

      setPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully.");

      logService.record({
        category: "security",
        severity: "success",
        actor: "Admin",
        title: "Profile updated",
        description: "The current administrator profile was updated from settings.",
      });
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Failed to update the profile."));
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications((previous) => {
      const updated = { ...previous, [key]: !previous[key] };
      localStorage.setItem("settings.notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage profile information, notification behavior, and presentation preferences without
            changing the existing design theme.
          </p>
        </div>

        <section className="card-elevated p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            <p className="text-sm text-muted-foreground">
              Update the current session identity and account details.
            </p>
          </div>

          {!canEditProfile ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              The backend currently allows profile updates for admin accounts only. This page stays
              available so the route and settings shell remain consistent.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <form onSubmit={handleProfileSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-first-name">First Name</Label>
              <Input
                id="settings-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={!canEditProfile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-last-name">Last Name</Label>
              <Input
                id="settings-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={!canEditProfile}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={!canEditProfile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-phone">Phone</Label>
              <Input
                id="settings-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={!canEditProfile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-password">New Password</Label>
              <Input
                id="settings-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={!canEditProfile}
                placeholder="Leave empty to keep current"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-confirm-password">Confirm Password</Label>
              <Input
                id="settings-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={!canEditProfile}
                placeholder="Repeat new password"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={saving || !canEditProfile}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </section>

        <section className="card-elevated p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Choose how the admin application keeps you informed.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm text-foreground">
              <span>Email alerts for visit approvals</span>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={() => toggleNotification("emailAlerts")}
                className="h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm text-foreground">
              <span>System updates and release notes</span>
              <input
                type="checkbox"
                checked={notifications.systemUpdates}
                onChange={() => toggleNotification("systemUpdates")}
                className="h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm text-foreground">
              <span>Robot fleet health notifications</span>
              <input
                type="checkbox"
                checked={notifications.robotStatus}
                onChange={() => toggleNotification("robotStatus")}
                className="h-4 w-4"
              />
            </label>
          </div>
        </section>

        <section className="card-elevated p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Keep the existing theme while allowing a light or dark presentation mode.
            </p>
          </div>

          <Button variant="outline" onClick={toggleTheme}>
            Switch to {darkMode ? "Light" : "Dark"} Mode
          </Button>
        </section>
      </div>
    </AppLayout>
  );
};

export default Settings;

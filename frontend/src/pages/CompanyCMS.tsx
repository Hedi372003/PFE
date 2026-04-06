import { useMemo, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { companyService, logService } from "@/services/api";

const CompanyCMS: React.FC = () => {
  const initialContent = useMemo(() => companyService.load(), []);
  const [name, setName] = useState(initialContent.name);
  const [supportEmail, setSupportEmail] = useState(initialContent.supportEmail);
  const [supportPhone, setSupportPhone] = useState(initialContent.supportPhone);
  const [hours, setHours] = useState(initialContent.hours);
  const [welcomeMessage, setWelcomeMessage] = useState(initialContent.welcomeMessage);
  const [lobbyInstructions, setLobbyInstructions] = useState(initialContent.lobbyInstructions);
  const [products, setProducts] = useState(initialContent.products.join("\n"));
  const [message, setMessage] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialContent.updatedAt);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextContent = companyService.save({
      name: name.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      hours: hours.trim(),
      welcomeMessage: welcomeMessage.trim(),
      lobbyInstructions: lobbyInstructions.trim(),
      products: products
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    });

    setLastUpdatedAt(nextContent.updatedAt);
    setMessage("Company content updated successfully.");
    window.setTimeout(() => setMessage(""), 2500);

    logService.record({
      category: "cms",
      severity: "success",
      actor: "Admin",
      title: "Company content updated",
      description: `${nextContent.name} presentation content was refreshed from the CMS page.`,
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Company CMS</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Maintain the public company profile, welcome content, support details, and product list
            used across the telepresence administration system.
          </p>
        </section>

        {message ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="card-elevated p-6">
            <form className="space-y-5" onSubmit={handleSave}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input id="company-name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-hours">Business hours</Label>
                  <Input id="company-hours" value={hours} onChange={(event) => setHours(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Support email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={supportEmail}
                    onChange={(event) => setSupportEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Support phone</Label>
                  <Input
                    id="company-phone"
                    value={supportPhone}
                    onChange={(event) => setSupportPhone(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-products">Products or services</Label>
                <Textarea
                  id="company-products"
                  value={products}
                  onChange={(event) => setProducts(event.target.value)}
                  placeholder="One product per line"
                  className="min-h-[130px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-welcome">Welcome message</Label>
                <Textarea
                  id="company-welcome"
                  value={welcomeMessage}
                  onChange={(event) => setWelcomeMessage(event.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-lobby">Lobby instructions</Label>
                <Textarea
                  id="company-lobby"
                  value={lobbyInstructions}
                  onChange={(event) => setLobbyInstructions(event.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button type="submit">Save Company Content</Button>
            </form>
          </div>

          <div className="card-elevated p-6">
            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-medium text-slate-300">Live preview</p>
              <h2 className="mt-2 text-2xl font-semibold">{name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{welcomeMessage}</p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">Support</p>
              <p className="mt-1 text-sm">{supportEmail}</p>
              <p className="text-sm">{supportPhone}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">Hours</p>
              <p className="mt-1 text-sm">{hours}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-border/70 bg-slate-50 p-4">
              <p className="text-sm font-medium text-foreground">Products</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {products
                  .split(/\r?\n|,/)
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl border border-border/70 bg-slate-50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Lobby instructions</p>
              <p className="mt-2">{lobbyInstructions}</p>
              <p className="mt-4 text-xs text-slate-500">Updated {formatDateTime(lastUpdatedAt)}</p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default CompanyCMS;

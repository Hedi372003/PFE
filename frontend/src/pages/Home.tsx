import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Wifi,
  Video,
  Shield,
  MapPin,
  Mail,
  Phone,
  X,
  Send,
  CalendarCheck,
  Loader2,
} from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { companyService, requestService } from "@/services/api";

const features = [
  {
    icon: Bot,
    title: "Visitor management",
    desc: "Handle visitor requests, approvals, and onboarding from one administration workspace.",
  },
  {
    icon: Video,
    title: "Audio and video support",
    desc: "Coordinate real-time telepresence calls and chat directly from the communication center.",
  },
  {
    icon: Wifi,
    title: "Robot supervision",
    desc: "Track fleet availability, battery, and control status from the robot operations interface.",
  },
  {
    icon: Shield,
    title: "Professional administration",
    desc: "Use a secure, typed frontend architecture ready for demos, growth, and future backend integrations.",
  },
];

interface ReserveFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const initialReserveForm: ReserveFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const Home: React.FC = () => {
  const company = useMemo(() => companyService.load(), []);

  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reserveForm, setReserveForm] = useState<ReserveFormState>(initialReserveForm);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [reserveToast, setReserveToast] = useState("");

  const closeReserveModal = () => {
    setShowReserveForm(false);
    setReserveError("");
  };

  const handleReserveSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReserveLoading(true);
    setReserveError("");

    try {
      await requestService.create(reserveForm);
      setReserveToast("Request submitted and approved automatically.");
      window.setTimeout(() => setReserveToast(""), 2500);
      setReserveForm(initialReserveForm);
      closeReserveModal();
    } catch {
      setReserveError("Failed to submit the request.");
    } finally {
      setReserveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <section className="bg-gradient-to-b from-[#1b3556] to-[#2c5d9e] px-6 pb-32 pt-40">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-5xl font-extrabold text-white md:text-6xl lg:text-7xl"
          >
            {company.name}
            <br />
            Telepresence Admin Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 text-lg leading-relaxed text-white/80 md:text-xl"
          >
            {company.welcomeMessage}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col justify-center gap-6 sm:flex-row"
          >

            <Button
              size="lg"
              className="bg-white/90 px-10 py-6 text-lg text-blue-700 hover:bg-white"
              onClick={() => setShowReserveForm(true)}
            >
              Request a Visit
            </Button>
          </motion.div>

          {reserveToast ? (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white">
              {reserveToast}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-14 text-center text-3xl font-bold">Platform Features</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border bg-gray-50 p-8"
              >
                <feature.icon className="mb-4 h-6 w-6 text-blue-600" />
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-8">
            <h3 className="mb-6 text-xl font-bold">Contact</h3>

            <div className="space-y-5">
              <div className="flex gap-4">
                <MapPin className="text-blue-600" />
                <p>{company.lobbyInstructions}</p>
              </div>
              <div className="flex gap-4">
                <Mail className="text-blue-600" />
                <p>{company.supportEmail}</p>
              </div>
              <div className="flex gap-4">
                <Phone className="text-blue-600" />
                <p>{company.supportPhone}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white p-8">
            <h3 className="text-xl font-bold">Products and Services</h3>
            <p className="mt-2 text-sm text-gray-600">Business hours: {company.hours}</p>
            <div className="mt-6 space-y-3">
              {company.products.map((product) => (
                <div key={product} className="rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {product}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-gray-500">
        2026 {company.name}. Telepresence robot administration platform.
      </footer>

      <AnimatePresence>
        {showReserveForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
            onClick={closeReserveModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-md rounded-xl border bg-white p-7 shadow-2xl"
            >
              <button
                onClick={closeReserveModal}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <CalendarCheck className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Request a Visit</h2>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                Fill out this form to register your visit request. It will be approved automatically
                and shared with the administration workspace.
              </p>

              {reserveError ? (
                <div className="mb-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {reserveError}
                </div>
              ) : null}

              <form onSubmit={handleReserveSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>First Name</Label>
                    <Input
                      placeholder="John"
                      value={reserveForm.firstName}
                      onChange={(event) => setReserveForm({ ...reserveForm, firstName: event.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Name</Label>
                    <Input
                      placeholder="Doe"
                      value={reserveForm.lastName}
                      onChange={(event) => setReserveForm({ ...reserveForm, lastName: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={reserveForm.email}
                    onChange={(event) => setReserveForm({ ...reserveForm, email: event.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+216 00 000 000"
                    value={reserveForm.phone}
                    onChange={(event) => setReserveForm({ ...reserveForm, phone: event.target.value })}
                    required
                  />
                </div>

                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                  Your request is accepted automatically. Only your contact information and visit
                  purpose are needed here.
                </div>

                <div className="space-y-1.5">
                  <Label>Visit purpose or requested robot</Label>
                  <Textarea
                    placeholder="Briefly describe the visit objective or requested robot context."
                    value={reserveForm.message}
                    onChange={(event) => setReserveForm({ ...reserveForm, message: event.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={reserveLoading}>
                  {reserveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {reserveLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Home;

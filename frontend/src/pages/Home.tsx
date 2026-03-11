import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/api/axios";

const features = [
  {
    icon: Bot,
    title: "Remote Robot Control",
    desc: "Operate telepresence robots from anywhere with real-time directional controls and monitoring.",
  },
  {
    icon: Video,
    title: "Live Video Stream",
    desc: "Stream high-quality video feeds from robots to stay connected to remote environments.",
  },
  {
    icon: Wifi,
    title: "Real-Time Communication",
    desc: "Enable two-way audio and video communication for seamless remote interaction.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    desc: "Enterprise-grade security with role-based access control and encrypted communications.",
  },
];

interface ReserveFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  message: string;
}

const initialReserveForm: ReserveFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  message: "",
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reserveForm, setReserveForm] =
    useState<ReserveFormState>(initialReserveForm);

  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [reserveToast, setReserveToast] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const closeReserveModal = () => {
    setShowReserveForm(false);
    setReserveError("");
  };

  const handleReserveSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setReserveLoading(true);
    setReserveError("");

    try {
      await api.post("/api/requests", reserveForm);

      setReserveToast("Request sent successfully");

      setTimeout(() => setReserveToast(""), 2500);

      setReserveForm(initialReserveForm);
      closeReserveModal();
    } catch {
      setReserveError("Failed to submit request");
    } finally {
      setReserveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <PublicNavbar />

      {/* HERO SECTION */}

      <section className="pt-40 pb-32 px-6 bg-gradient-to-b from-blue-700 to-blue-600">

        <div className="max-w-4xl mx-auto text-center">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8"
          >
            Telepresence Robot
            <br />
            Management Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed"
          >
            Supervise and control telepresence robots remotely with real-time
            video streaming, two-way communication and intuitive directional
            controls. Bridging physical presence and digital connectivity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >

            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100 px-10 py-6 text-lg font-semibold"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>

            <Button
              size="lg"
              className="bg-white/90 text-blue-700 hover:bg-white px-10 py-6 text-lg"
              onClick={() => setShowReserveForm(true)}
            >
              Reserve Robot
            </Button>

          </motion.div>

        </div>
      </section>

      {/* FEATURES */}

      <section className="py-24 px-6 bg-white">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-14">
            Platform Features
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-gray-50 rounded-xl border"
              >
                <f.icon className="h-6 w-6 text-blue-600 mb-4" />

                <h3 className="font-semibold text-lg mb-2">
                  {f.title}
                </h3>

                <p className="text-gray-600 text-sm">
                  {f.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* CONTACT */}

      <section className="py-24 px-6 bg-gray-50">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">

          <div className="bg-white p-8 rounded-xl border">

            <h3 className="text-xl font-bold mb-6">Get in Touch</h3>

            <div className="space-y-5">

              <div className="flex gap-4">
                <MapPin className="text-blue-600" />
                <p>
                  123 Innovation Boulevard
                  <br />
                  Paris, France
                </p>
              </div>

              <div className="flex gap-4">
                <Mail className="text-blue-600" />
                <p>contact@telebot.com</p>
              </div>

              <div className="flex gap-4">
                <Phone className="text-blue-600" />
                <p>+33 1 23 45 67 89</p>
              </div>

            </div>

          </div>

          <div className="bg-white border rounded-xl overflow-hidden">

            <iframe
              title="Location"
              src="https://www.google.com/maps?q=Paris&output=embed"
              className="w-full h-[350px]"
            />

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="py-10 text-center text-sm text-gray-500 border-t">
        2026 TeleBot. Telepresence Robot Management Platform.
      </footer>

      {/* RESERVE MODAL */}

      <AnimatePresence>

        {showReserveForm && (

          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReserveModal}
          >

            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >

              <h2 className="text-xl font-bold mb-4">
                Reserve a Robot
              </h2>

              {reserveError && (
                <p className="text-red-500 text-sm mb-2">
                  {reserveError}
                </p>
              )}

              <form
                onSubmit={handleReserveSubmit}
                className="space-y-4"
              >

                <Input
                  placeholder="First Name"
                  value={reserveForm.firstName}
                  onChange={(e) =>
                    setReserveForm({
                      ...reserveForm,
                      firstName: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Last Name"
                  value={reserveForm.lastName}
                  onChange={(e) =>
                    setReserveForm({
                      ...reserveForm,
                      lastName: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Email"
                  type="email"
                  value={reserveForm.email}
                  onChange={(e) =>
                    setReserveForm({
                      ...reserveForm,
                      email: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Phone"
                  value={reserveForm.phone}
                  onChange={(e) =>
                    setReserveForm({
                      ...reserveForm,
                      phone: e.target.value,
                    })
                  }
                  required
                />

                <Textarea
                  placeholder="Describe how you will use the robot"
                  value={reserveForm.message}
                  onChange={(e) =>
                    setReserveForm({
                      ...reserveForm,
                      message: e.target.value,
                    })
                  }
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={reserveLoading}
                >
                  {reserveLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Submit Request"
                  )}
                </Button>

              </form>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default Home;
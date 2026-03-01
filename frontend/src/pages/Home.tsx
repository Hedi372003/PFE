import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Wifi, Video, Shield, MapPin, Mail, Phone, X, Send, CalendarCheck } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Remote Robot Control",
    desc: "Operate telepresence robots from anywhere with real-time directional controls and status monitoring.",
  },
  {
    icon: Video,
    title: "Live Video Stream",
    desc: "Stream high-quality video feeds from robots to maintain visual awareness of remote environments.",
  },
  {
    icon: Wifi,
    title: "Real-Time Communication",
    desc: "Enable two-way audio and video communication through the robot for seamless remote interaction.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    desc: "Enterprise-grade security with role-based access control and encrypted communications.",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reserveForm, setReserveForm] = useState({ name: "", email: "", phone: "", robotModel: "", message: "" });
  const [reserveSent, setReserveSent] = useState(false);

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReserveSent(true);
    setTimeout(() => {
      setShowReserveForm(false);
      setReserveSent(false);
      setReserveForm({ name: "", email: "", phone: "", robotModel: "", message: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="gradient-hero pt-36 pb-24 px-6">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight tracking-tight"
          >
            Telepresence Robot
            <br />Management Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Supervise and control telepresence robots remotely with real-time video streaming,
            two-way communication, and intuitive directional controls. Bridging physical presence
            and digital connectivity for enterprise and academic environments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              variant="secondary"
              className="btn-transition font-semibold px-8"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-transition border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 px-8"
              onClick={() => setShowReserveForm(true)}
            >
              <CalendarCheck className="h-4 w-4" /> Reserve a Robot
            </Button>
            <Link to="/shop">
              <Button size="lg" variant="outline" className="btn-transition border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8">
                Browse Robots
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 gradient-subtle">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 tracking-tight">
              Platform Features
            </h2>
            <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto text-lg">
              Everything you need to manage and operate your fleet of telepresence robots from a single, unified dashboard.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="card-elevated p-7"
              >
                <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 tracking-tight">
              Contact & Location
            </h2>
            <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto text-lg">
              Get in touch with our team or visit us at our office. We're here to help you get started with telepresence.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="card-elevated p-8 space-y-6"
            >
              <h3 className="text-xl font-bold text-foreground">Get in Touch</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Address</p>
                    <p className="text-sm text-muted-foreground">123 Innovation Boulevard, Tech District<br />Paris, France 75001</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Email</p>
                    <p className="text-sm text-muted-foreground">contact@telebot.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Phone</p>
                    <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Google Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="card-elevated overflow-hidden"
            >
              <iframe
                title="Company Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.991625584!2d2.3488!3d48.8566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1f06e2b70f%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2sfr!4v1700000000000!5m2!1sen!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 320 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6 bg-muted/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2026 TeleBot. Telepresence Robot Management Platform. All rights reserved.
        </div>
      </footer>

      {/* Reserve Robot Modal */}
      <AnimatePresence>
        {showReserveForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReserveForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
className="bg-white rounded-xl border shadow-2xl max-w-md w-full p-7 relative"            >
              <button
                onClick={() => setShowReserveForm(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground btn-transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Reserve a Robot</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Fill out this form to request a robot reservation. Our team will review and confirm your booking.
              </p>

              {reserveSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-semibold text-foreground">Request Sent!</p>
                  <p className="text-sm text-muted-foreground mt-1">We'll get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleReserveSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" value={reserveForm.name} onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" placeholder="john@company.com" value={reserveForm.email} onChange={(e) => setReserveForm({ ...reserveForm, email: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="+33 6 12 34 56 78" value={reserveForm.phone} onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Robot Model</Label>
                    <Input placeholder="TeleBot Pro" value={reserveForm.robotModel} onChange={(e) => setReserveForm({ ...reserveForm, robotModel: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message</Label>
                    <Textarea placeholder="Tell us about your use case..." value={reserveForm.message} onChange={(e) => setReserveForm({ ...reserveForm, message: e.target.value })} rows={3} />
                  </div>
                  <Button type="submit" className="w-full btn-transition gap-2">
                    <Send className="h-4 w-4" /> Submit Request
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

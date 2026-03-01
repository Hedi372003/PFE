import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-card/90 backdrop-blur-sm">
      <div className="container mx-auto h-full flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Bot className="h-7 w-7 text-accent" />
          <span className="font-bold text-xl text-foreground">TeleBot</span>
        </Link>
        <Link to="/login">
          <Button className="btn-transition">Sign In</Button>
        </Link>
      </div>
    </header>
  );
}

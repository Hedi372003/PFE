import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type MetricTone = "default" | "success" | "warning" | "critical";

const toneClasses: Record<MetricTone, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-slate-950",
  critical: "bg-rose-600 text-white",
};

interface MetricCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: MetricTone;
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: MetricCardProps) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{helper}</p>
        </div>

        <div className={cn("rounded-2xl p-3 shadow-sm", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

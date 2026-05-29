import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type MetricTone = "default" | "info" | "success" | "violet" | "warning" | "critical";

const iconToneClasses: Record<MetricTone, string> = {
  default: "border-slate-200 bg-slate-900 text-white shadow-slate-200",
  info: "border-blue-200 bg-[#2563eb] text-white shadow-blue-100",
  success: "border-emerald-200 bg-[#10b981] text-white shadow-emerald-100",
  violet: "border-violet-200 bg-[#7c3aed] text-white shadow-violet-100",
  warning: "border-amber-200 bg-[#f59e0b] text-slate-950 shadow-amber-100",
  critical: "border-rose-200 bg-rose-600 text-white shadow-rose-100",
};

const accentToneClasses: Record<MetricTone, string> = {
  default: "bg-slate-900",
  info: "bg-[#2563eb]",
  success: "bg-[#10b981]",
  violet: "bg-[#7c3aed]",
  warning: "bg-[#f59e0b]",
  critical: "bg-rose-600",
};

const surfaceToneClasses: Record<MetricTone, string> = {
  default: "bg-gradient-to-br from-white to-slate-50",
  info: "bg-gradient-to-br from-white to-blue-50/80",
  success: "bg-gradient-to-br from-white to-emerald-50/70",
  violet: "bg-gradient-to-br from-white to-violet-50/70",
  warning: "bg-gradient-to-br from-white to-amber-50/80",
  critical: "bg-gradient-to-br from-white to-rose-50/70",
};

interface MetricCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: MetricTone;
  active?: boolean;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
  active = false,
  onClick,
}: MetricCardProps) {
  const CardTag = onClick ? "button" : "div";

  return (
    <CardTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "card-elevated group relative w-full overflow-hidden p-6 text-left transition duration-200",
        surfaceToneClasses[tone],
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400/50"
          : "",
        active ? "border-slate-700 shadow-xl ring-2 ring-slate-300/70" : "",
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1.5", accentToneClasses[tone])} />

      <div className="flex items-start justify-between gap-5 pl-2">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-600">{label}</p>
            <p className="text-4xl font-bold tracking-normal text-slate-950">
              {value}
            </p>
          </div>

          <p className="max-w-[17rem] text-sm leading-6 text-slate-500">
            {helper}
          </p>
        </div>

        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-lg transition group-hover:scale-105",
            iconToneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardTag>
  );
}

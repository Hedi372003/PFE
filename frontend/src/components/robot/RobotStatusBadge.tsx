import type { RobotStatus } from "@/types/robot";

const badgeClasses: Record<RobotStatus, string> = {
  online: "bg-emerald-100 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  offline: "bg-slate-200 text-slate-700 border-slate-300",
};

interface RobotStatusBadgeProps {
  status: RobotStatus;
}

export function RobotStatusBadge({ status }: RobotStatusBadgeProps) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${badgeClasses[status]}`}>
      {status}
    </span>
  );
}

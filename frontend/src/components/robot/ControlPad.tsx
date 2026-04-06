import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, StopCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RobotCommand } from "@/types/robot";

interface ControlPadProps {
  disabled?: boolean;
  onCommand: (command: RobotCommand) => void;
}

export function ControlPad({ disabled = false, onCommand }: ControlPadProps) {
  const directionalButtonClassName =
    "h-14 w-14 rounded-2xl bg-slate-900 text-white hover:bg-slate-800";

  return (
    <div className="card-elevated p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Directional Control</h2>
        <p className="text-sm text-muted-foreground">
          Use press-and-hold controls for robot movement and release to stop safely.
        </p>
      </div>

      <div className="mx-auto grid w-fit grid-cols-3 gap-3">
        <div />
        <Button
          disabled={disabled}
          className={directionalButtonClassName}
          onPointerDown={() => onCommand("forward")}
          onPointerUp={() => onCommand("stop")}
          onPointerLeave={() => onCommand("stop")}
          aria-label="Move forward"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <div />

        <Button
          disabled={disabled}
          className={directionalButtonClassName}
          onPointerDown={() => onCommand("left")}
          onPointerUp={() => onCommand("stop")}
          onPointerLeave={() => onCommand("stop")}
          aria-label="Move left"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Button
          disabled={disabled}
          variant="outline"
          className="h-14 w-14 rounded-2xl border-2"
          onClick={() => onCommand("stop")}
          aria-label="Stop robot"
        >
          <StopCircle className="h-5 w-5" />
        </Button>

        <Button
          disabled={disabled}
          className={directionalButtonClassName}
          onPointerDown={() => onCommand("right")}
          onPointerUp={() => onCommand("stop")}
          onPointerLeave={() => onCommand("stop")}
          aria-label="Move right"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>

        <div />
        <Button
          disabled={disabled}
          className={directionalButtonClassName}
          onPointerDown={() => onCommand("back")}
          onPointerUp={() => onCommand("stop")}
          onPointerLeave={() => onCommand("stop")}
          aria-label="Move backward"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
        <div />
      </div>
    </div>
  );
}

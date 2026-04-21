import { useEffect, useId } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmationMessage?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  loadingText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Confirm action",
  description = "Are you sure? This action cannot be undone.",
  confirmationMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  loadingText = "Processing...",
  onConfirm,
  onCancel,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
      onClick={loading ? undefined : onCancel}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="card-elevated w-full max-w-md animate-in fade-in zoom-in-95 p-6"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Confirmation
          </span>

          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            {title}
          </h2>

          <p id={descriptionId} className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          {confirmationMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {confirmationMessage}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            variant="destructive"
            className="min-w-[9rem]"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingText : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

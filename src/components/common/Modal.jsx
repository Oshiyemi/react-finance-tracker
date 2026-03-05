import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Modal({
  children,
  description,
  footer,
  isOpen,
  onClose,
  title,
  width = "max-w-2xl",
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-[101] w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl shadow-slate-950/25 dark:border-white/10 dark:bg-slate-950/95",
          width
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-emerald-100/80 px-6 py-5 dark:border-emerald-950/70">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-emerald-100/80 px-6 py-4 dark:border-emerald-950/70">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

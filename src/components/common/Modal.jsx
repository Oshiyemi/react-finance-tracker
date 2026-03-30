import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * @param {HTMLElement | null} root
 * @returns {HTMLElement[]}
 */
function getFocusableElements(root) {
  if (!root) {
    return [];
  }

  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];

  return Array.from(root.querySelectorAll(selectors.join(","))).filter(
    (element) => !element.hasAttribute("hidden")
  );
}

export default function Modal({
  children,
  description,
  footer,
  isOpen,
  onClose,
  title,
  width = "max-w-2xl",
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = getFocusableElements(dialogRef.current);
    const firstFocusable = focusable[0] || dialogRef.current;
    firstFocusable?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusable = getFocusableElements(dialogRef.current);

      if (currentFocusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const firstElement = currentFocusable[0];
      const lastElement = currentFocusable[currentFocusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused && previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close modal"
        onMouseDown={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-[101] flex w-full max-h-[min(86dvh,48rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl shadow-slate-950/25 outline-none dark:border-white/10 dark:bg-slate-950/95",
          width
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-emerald-100/80 px-4 py-4 sm:px-6 dark:border-emerald-950/70">
          <div className="space-y-1">
            <h2 id={titleId} className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer ? (
          <div className="border-t border-emerald-100/80 px-4 py-4 sm:px-6 dark:border-emerald-950/70">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}


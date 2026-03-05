import { useEffect, useState } from "react";
import { Clock3, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useAuthStore } from "@/state/useAuthStore";

function formatGuestTimeLabel(daysRemaining) {
  if (daysRemaining <= 0) {
    return "Trial ended";
  }

  if (daysRemaining === 1) {
    return "1 day left";
  }

  return `${daysRemaining} days left`;
}

export default function GuestAccessBanner() {
  const { hasSession, isGuest, isGuestLocked, guestDaysRemaining, guestLockReason } =
    useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isGuest && isGuestLocked) {
      setIsModalOpen(true);
    }
  }, [isGuest, isGuestLocked]);

  if (!hasSession || !isGuest) {
    return null;
  }

  const hasExpired = isGuestLocked && guestLockReason !== "migrated";
  const message = hasExpired
    ? "Guest access ended \u2014 create an account to keep your data."
    : guestLockReason === "migrated"
      ? "This guest session was already migrated. Sign in to your account to continue."
      : `Guest mode is active: ${formatGuestTimeLabel(guestDaysRemaining)}.`;

  return (
    <>
      <div className="mt-4 w-full px-4 lg:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div
            className={`mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 md:flex-row md:items-center md:justify-between ${
              isGuestLocked
                ? "border-amber-300/80 bg-amber-50/90 dark:border-amber-500/40 dark:bg-amber-500/10"
                : "border-emerald-200/80 bg-white/80 dark:border-emerald-900/70 dark:bg-slate-950/75"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                  isGuestLocked
                    ? "bg-amber-500/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200"
                    : "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}
              >
                <Clock3 className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{message}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/auth/register">
                <Button size="sm">
                  <UserPlus className="h-4 w-4" />
                  Create account
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="sm" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen && hasExpired}
        onClose={() => setIsModalOpen(false)}
        title="Guest trial ended"
        description="Guest access ended \u2014 create an account to keep your data."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Continue read-only
            </Button>
            <Link to="/auth/register">
              <Button onClick={() => setIsModalOpen(false)}>Create account</Button>
            </Link>
          </div>
        }
      >
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          You can still review your guest data, but editing, adding, and deleting are now
          disabled. Sign up or log in to keep managing your finances.
        </p>
      </Modal>
    </>
  );
}

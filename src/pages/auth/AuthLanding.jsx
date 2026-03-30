import { useEffect } from "react";
import { ArrowRight, LogIn, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/auth/AuthFrame";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/state/useAuthStore";
import { GUEST_TRIAL_DAYS } from "@/utils/constants";

export default function AuthLanding() {
  const {
    continueAsGuest,
    guestDaysRemaining,
    hasSession,
    isAccount,
    isGuest,
    isGuestExpired,
    isReady,
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && isAccount && hasSession) {
      navigate("/dashboard", { replace: true });
    }
  }, [hasSession, isAccount, isReady, navigate]);

  if (!isReady) {
    return null;
  }

  function handleGuestContinue() {
    continueAsGuest();
    navigate("/dashboard");
  }

  return (
    <AuthFrame
      title="Choose your workspace"
      description={`Start in the mode that fits how you want to track money right now. Guest mode opens instantly for up to ${GUEST_TRIAL_DAYS} day(s), while account mode keeps a dedicated workspace on this browser.`}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isGuest
            ? isGuestExpired
              ? "Guest mode is now read-only. Create an account or sign in to keep editing."
              : `Guest mode is active with ${guestDaysRemaining} day(s) remaining.`
            : "Pick guest mode for immediate access, or use login/create account for a dedicated workspace."}
        </p>

        <div className="space-y-2.5">
          <Button className="w-full justify-between" size="lg" onClick={handleGuestContinue}>
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Continue as Guest
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button className="w-full" variant="outline" size="lg" onClick={() => navigate("/auth/login")}>
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          <Button className="w-full" variant="accent" size="lg" onClick={() => navigate("/auth/register")}>
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white/70 p-3.5 dark:border-emerald-900/70 dark:bg-slate-950/60">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Auth and data stay local on this device. This build does not include backend sync or cross-device access.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          You can reopen this choice from
          <Link
            className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            to="/settings"
          >
            Settings
          </Link>
          .
        </p>
      </div>
    </AuthFrame>
  );
}

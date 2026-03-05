import { useEffect } from "react";
import { ArrowRight, ShieldCheck, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import ThemedLogo from "@/components/common/ThemedLogo";
import { useAuthStore } from "@/state/useAuthStore";
import { GUEST_TRIAL_DAYS } from "@/utils/constants";

const highlights = [
  "Track spending and income with a clean emerald-and-gold workspace.",
  "Set monthly budgets by category and catch overruns early.",
  "Review the last 12 months of savings performance and category mix.",
];

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
    <div className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-emerald-400/25 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-[-6rem] right-[-2rem] h-[20rem] w-[20rem] rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-400/10" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/70 px-4 py-2 shadow-lg shadow-emerald-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <ThemedLogo
              alt="FinTrack Wealth"
              className="rounded-2xl p-1"
              imageClassName="h-8 w-auto max-w-[7rem] object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
                Personal finance tracker
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Local-first, premium, and organized for real monthly planning.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
              Prosperity starts with clarity
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950 dark:text-white md:text-6xl">
              A cleaner money cockpit for daily tracking, budgets, and monthly reviews.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              FinTrack Wealth gives you a guest workspace instantly and an account
              mode when you want separate storage. Guest mode runs for{" "}
              {GUEST_TRIAL_DAYS} days before it becomes read-only.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((highlight) => (
              <Card key={highlight} className="min-h-[9rem]" tone="highlight">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {highlight}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-xl" padding="p-8" tone="highlight">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <WalletCards className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">
                Step into your finance workspace
              </h2>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {isGuest
                  ? isGuestExpired
                    ? "Your guest trial has ended. Continue in read-only mode or switch to account mode."
                    : `Your guest session is active with ${guestDaysRemaining} day(s) left.`
                  : `Choose the fastest path in. Guest mode works immediately for ${GUEST_TRIAL_DAYS} days, and account mode keeps a separate local workspace.`}
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full justify-between" onClick={handleGuestContinue} size="lg">
                Continue as Guest
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth/login")}
              >
                Login
              </Button>
              <Button
                className="w-full"
                variant="accent"
                size="lg"
                onClick={() => navigate("/auth/register")}
              >
                Create account
              </Button>
            </div>

            <div className="rounded-[1.5rem] border border-emerald-200/80 bg-white/70 p-5 dark:border-emerald-950/70 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    Local auth notice
                  </p>
                  <p>
                    Account login and registration are browser-local in this
                    refactor. Guest and account workspaces are separated, but data
                    does not sync across devices without a backend.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Need to switch later? Guest mode stays available from the navbar and
              <Link
                className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                to="/settings"
              >
                settings
              </Link>
              .
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

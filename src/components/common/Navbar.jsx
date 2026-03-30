import { useEffect, useId, useState } from "react";
import {
  LogIn,
  LogOut,
  Menu,
  MoonStar,
  SunMedium,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import ThemedLogo from "@/components/common/ThemedLogo";
import { useAuthStore } from "@/state/useAuthStore";
import { APP_NAME, NAV_ITEMS } from "@/utils/constants";
import { cn } from "@/utils/cn";

function navLinkClassName(isActive) {
  return cn(
    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
    isActive
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
      : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white"
  );
}

function authLinkClassName(isActive, variant = "outline") {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400";

  if (variant === "primary") {
    return cn(
      base,
      isActive
        ? "bg-emerald-700 text-white dark:bg-emerald-300 dark:text-slate-950"
        : "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
    );
  }

  return cn(
    base,
    isActive
      ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "border border-emerald-200/80 bg-white/85 text-slate-800 hover:border-emerald-300 hover:bg-white dark:border-emerald-900/70 dark:bg-slate-950/75 dark:text-slate-100 dark:hover:border-emerald-800"
  );
}

function SessionPill({ guestDaysRemaining, isGuest, isGuestLocked, name }) {
  return (
    <span className="inline-flex max-w-[13rem] items-center gap-2 rounded-lg border border-emerald-200/80 bg-white/85 px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-emerald-900/70 dark:bg-slate-950/75 dark:text-slate-200">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <UserRound className="h-3.5 w-3.5" />
      </span>
      <span className="truncate">
        {isGuest
          ? isGuestLocked
            ? "Guest (Read-only)"
            : `Guest (${guestDaysRemaining}d left)`
          : name || APP_NAME}
      </span>
    </span>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    guestDaysRemaining,
    hasSession,
    isGuest,
    isGuestLocked,
    isReady,
    logout,
    session,
    theme,
    toggleTheme,
  } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileMenuId = useId();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  const brandTarget = hasSession ? "/dashboard" : "/auth";

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/72 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="flex min-w-0 items-center gap-3" to={brandTarget}>
            <ThemedLogo
              alt={APP_NAME}
              className="rounded-lg p-1"
              imageClassName="h-7 w-auto max-w-[6rem] object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950 dark:text-white">
                {APP_NAME}
              </p>
            </div>
          </Link>

          {isReady && hasSession ? (
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navLinkClassName(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={theme === "dark"}
            size="icon"
            title="Toggle theme"
            variant="outline"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <MoonStar className="h-4 w-4" />
            )}
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            {isReady && hasSession ? (
              <>
                <SessionPill
                  guestDaysRemaining={guestDaysRemaining}
                  isGuest={isGuest}
                  isGuestLocked={isGuestLocked}
                  name={session?.name}
                />
                {isGuest ? (
                  <NavLink
                    className={({ isActive }) => authLinkClassName(isActive, "primary")}
                    to="/auth/register"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </NavLink>
                ) : null}
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {isGuest ? "End guest" : "Logout"}
                </Button>
              </>
            ) : isReady ? (
              <>
                <NavLink className={({ isActive }) => authLinkClassName(isActive)} to="/auth/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </NavLink>
                <NavLink
                  className={({ isActive }) => authLinkClassName(isActive, "primary")}
                  to="/auth/register"
                >
                  <UserPlus className="h-4 w-4" />
                  Create account
                </NavLink>
              </>
            ) : null}
          </div>

          <Button
            aria-controls={mobileMenuId}
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="lg:hidden"
            size="icon"
            title={isMobileOpen ? "Close menu" : "Open menu"}
            variant="outline"
            onClick={() => setIsMobileOpen((currentValue) => !currentValue)}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMobileOpen ? (
        <div
          id={mobileMenuId}
          className="border-t border-white/30 bg-white/88 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
            {isReady && hasSession ? (
              <>
                <SessionPill
                  guestDaysRemaining={guestDaysRemaining}
                  isGuest={isGuest}
                  isGuestLocked={isGuestLocked}
                  name={session?.name}
                />
                <nav aria-label="Mobile primary" className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => navLinkClassName(isActive)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="flex flex-col gap-2">
                  {isGuest ? (
                    <NavLink
                      className={({ isActive }) => authLinkClassName(isActive, "primary")}
                      to="/auth/register"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </NavLink>
                  ) : null}
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {isGuest ? "End guest" : "Logout"}
                  </Button>
                </div>
              </>
            ) : isReady ? (
              <div className="flex flex-col gap-2">
                <NavLink className={({ isActive }) => authLinkClassName(isActive)} to="/auth/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </NavLink>
                <NavLink
                  className={({ isActive }) => authLinkClassName(isActive, "primary")}
                  to="/auth/register"
                >
                  <UserPlus className="h-4 w-4" />
                  Create account
                </NavLink>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}


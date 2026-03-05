import { useEffect, useState } from "react";
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

function getNavItemClassName(isActive) {
  return cn(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors [&>svg]:shrink-0 [&>svg]:align-middle lg:px-2.5",
    isActive
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
      : "text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white"
  );
}

function getAuthLinkClassName(isActive, variant = "outline") {
  const shared =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-semibold transition-colors [&>svg]:shrink-0 [&>svg]:align-middle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent lg:px-2.5";

  if (variant === "primary") {
    return cn(
      shared,
      isActive
        ? "bg-emerald-700 text-white dark:bg-emerald-400 dark:text-slate-950"
        : "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400"
    );
  }

  return cn(
    shared,
    isActive
      ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "border border-emerald-200/80 bg-white/85 text-slate-800 hover:border-emerald-300 hover:bg-white dark:border-emerald-900/70 dark:bg-slate-950/75 dark:text-slate-100 dark:hover:border-emerald-800 dark:hover:bg-slate-950"
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

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  const brandTarget = hasSession ? "/dashboard" : "/auth";

  const desktopNavLinks = (
    <nav className="flex min-w-0 flex-nowrap items-center gap-1 lg:gap-1.5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => getNavItemClassName(isActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const loggedInDesktopControls = (
    <>
      <span className="inline-flex max-w-[10rem] items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-white/85 px-2 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-emerald-900/70 dark:bg-slate-950/75 dark:text-slate-200 xl:max-w-[13rem]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <UserRound className="h-4 w-4" />
        </span>
        <span className="truncate">
          {isGuest
            ? isGuestLocked
              ? "Guest (Read-only)"
              : `Guest (${guestDaysRemaining}d left)`
            : session?.name || APP_NAME}
        </span>
      </span>

      {isGuest ? (
        <NavLink className={({ isActive }) => getAuthLinkClassName(isActive, "primary")} to="/auth/register">
          <UserPlus className="h-4 w-4" />
          <span className="hidden xl:inline">Create account</span>
          <span className="xl:hidden">Create</span>
        </NavLink>
      ) : null}

      <Button
        variant="destructive"
        size="md"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden xl:inline">
          {isGuest ? "End guest session" : "Logout"}
        </span>
        <span className="xl:hidden">{isGuest ? "End" : "Out"}</span>
      </Button>
    </>
  );

  const loggedOutDesktopControls = (
    <>
      <NavLink className={({ isActive }) => getAuthLinkClassName(isActive)} to="/auth/login">
        <LogIn className="h-4 w-4" />
        <span className="hidden xl:inline">Login</span>
        <span className="xl:hidden">Log in</span>
      </NavLink>
      <NavLink className={({ isActive }) => getAuthLinkClassName(isActive, "primary")} to="/auth/register">
        <UserPlus className="h-4 w-4" />
        <span className="hidden xl:inline">Create account</span>
        <span className="xl:hidden">Create</span>
      </NavLink>
    </>
  );

  const desktopActionControls = (
    <div className="flex shrink-0 flex-nowrap items-center gap-2">
      {isReady ? (hasSession ? loggedInDesktopControls : loggedOutDesktopControls) : null}
    </div>
  );

  const mobileNavLinks = (
    <nav className="flex flex-col gap-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => getNavItemClassName(isActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const mobileActionControls = (
    <div className="flex flex-col gap-2">
      {isReady ? (hasSession ? loggedInDesktopControls : loggedOutDesktopControls) : null}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 lg:px-6">
        <div className="flex w-full flex-nowrap items-center justify-between gap-3 md:gap-4">
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 md:gap-4">
            <Link className="flex min-w-0 shrink-0 items-center gap-3" to={brandTarget}>
              <ThemedLogo
                alt={APP_NAME}
                className="rounded-xl p-1"
                imageClassName="h-7 w-auto max-w-[6.25rem] object-contain lg:h-8"
              />
              <div className="min-w-0">
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300 lg:block">
                  Prosperity hub
                </p>
                <p className="truncate text-base font-semibold text-slate-950 dark:text-white lg:text-lg">
                  {APP_NAME}
                </p>
              </div>
            </Link>

            {isReady && hasSession ? (
              <div className="hidden min-w-0 flex-1 lg:flex">{desktopNavLinks}</div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <Button
              aria-label="Toggle theme"
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

            <div className="hidden lg:flex">{desktopActionControls}</div>

            <Button
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
      </div>

      {isMobileOpen ? (
        <div className="border-t border-white/30 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4">
            {isReady && hasSession ? mobileNavLinks : null}
            {mobileActionControls}
          </div>
        </div>
      ) : null}
    </header>
  );
}

import { Download, LogOut, Palette, ShieldCheck, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import { useAuthStore } from "@/state/useAuthStore";
import { useAppStore } from "@/state/useAppStore";
import { STORAGE_SCHEMA_VERSION } from "@/utils/constants";

export default function Settings() {
  const navigate = useNavigate();
  const {
    hasPendingGuestMigration,
    isAuthLoading,
    isGuest,
    logout,
    pendingGuestMigration,
    retryGuestMigration,
    session,
    theme,
    toggleTheme,
  } = useAuthStore();
  const {
    clearWorkspace,
    exportWorkspace,
    isReady,
    isReadOnly,
    readOnlyMessage,
    storageLabel,
    storageNamespace,
    transactions,
    budgets,
  } = useAppStore();

  if (!isReady) {
    return <Loader label="Loading settings..." />;
  }

  function downloadWorkspace() {
    const blob = new Blob([exportWorkspace()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${storageNamespace || "workspace"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleClearWorkspace() {
    const shouldClear = window.confirm(
      "Clear all transactions and budgets in the current workspace?"
    );

    if (shouldClear) {
      const result = clearWorkspace();

      if (result?.ok === false) {
        window.alert(result.message);
      }
    }
  }

  async function handleRetryMigration() {
    const result = await retryGuestMigration();
    window.alert(result.message);
  }

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Control room"
        title="Settings"
        description="Review how auth works in this refactor, inspect the active storage namespace, and manage exported data."
      />

      {isReadOnly ? (
        <div className="surface-card border-amber-300/80 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {readOnlyMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone="highlight">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  Session and auth
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This implementation uses local auth only. Account and guest modes
                  are stored separately inside browser localStorage.
                </p>
              </div>
            </div>

            {hasPendingGuestMigration ? (
              <div className="rounded-[1.5rem] border border-amber-300/80 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <p className="font-semibold">Guest data migration is pending</p>
                <p className="mt-1">
                  {pendingGuestMigration?.lastError || "A previous migration attempt did not complete."}
                </p>
                <div className="mt-3">
                  <Button loading={isAuthLoading} onClick={handleRetryMigration} size="sm">
                    Retry migration
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">Mode</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {isGuest ? "Guest" : "Account"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">Identity</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {session?.name}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {session?.email || "No email in guest mode"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isGuest ? (
                <>
                  <Link to="/auth/register">
                    <Button>Create account</Button>
                  </Link>
                  <Link to="/auth/login">
                    <Button variant="outline">Switch to account</Button>
                  </Link>
                </>
              ) : (
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  Appearance
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Dark mode is class-based and stored in localStorage so your
                  preference persists.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current theme</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {theme === "dark" ? "Dark" : "Light"}
              </p>
            </div>

            <Button variant="outline" onClick={toggleTheme}>
              Toggle theme
            </Button>
          </div>
        </Card>
      </div>

      <Card tone="highlight">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Workspace storage
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Transactions and budgets are namespaced so guest data and account
              data remain separate.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Schema version</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {STORAGE_SCHEMA_VERSION}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Namespace</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {storageLabel || "No workspace"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Transactions</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {transactions.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Budgets</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {budgets.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadWorkspace}>
              <Download className="h-4 w-4" />
              Export workspace JSON
            </Button>
            <Button
              variant="destructive"
              disabled={isReadOnly}
              onClick={handleClearWorkspace}
              title={readOnlyMessage}
            >
              <Trash2 className="h-4 w-4" />
              Clear current workspace
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

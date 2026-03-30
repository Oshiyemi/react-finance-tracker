import {
  CircleHelp,
  Download,
  LogOut,
  Palette,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import StatTile from "@/components/common/StatTile";
import StatusBanner from "@/components/common/StatusBanner";
import { TUTORIAL_OPEN_EVENT } from "@/components/tutorial/AppTutorialModal";
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
      "Clear all transactions and budgets in the current workspace? This cannot be undone."
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

  function handleOpenTutorial() {
    window.dispatchEvent(new CustomEvent(TUTORIAL_OPEN_EVENT));
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Settings"
        title="Workspace and privacy"
        description="Manage theme, local data, exports, and account mode details."
      />

      {isReadOnly ? (
        <StatusBanner tone="warning" title="Read-only mode">
          {readOnlyMessage}
        </StatusBanner>
      ) : null}

      {hasPendingGuestMigration ? (
        <StatusBanner
          tone="warning"
          title="Guest migration pending"
          action={
            <Button loading={isAuthLoading} onClick={handleRetryMigration} size="sm">
              Retry migration
            </Button>
          }
        >
          {pendingGuestMigration?.lastError || "A previous migration attempt did not complete."}
        </StatusBanner>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card tone="highlight">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Session</h2>
                <p className="section-subtitle">Local browser authentication only.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatTile caption="Mode" value={isGuest ? "Guest" : "Account"} />
              <StatTile
                caption="Identity"
                value={session?.name || "Unknown"}
                helper={session?.email || "No email in guest mode"}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {isGuest ? (
                <>
                  <Link to="/auth/register">
                    <Button>Create account</Button>
                  </Link>
                  <Link to="/auth/login">
                    <Button variant="outline">Login</Button>
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Appearance and help</h2>
                <p className="section-subtitle">Theme and onboarding controls.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatTile caption="Current theme" value={theme === "dark" ? "Dark" : "Light"} />
              <StatTile caption="Tutorial" value="7-step quick tour" helper="Available anytime" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={toggleTheme}>
                Toggle theme
              </Button>
              <Button variant="outline" onClick={handleOpenTutorial}>
                <CircleHelp className="h-4 w-4" />
                Open tutorial
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card tone="highlight">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Workspace data</h2>
            <p className="section-subtitle">
              Guest and account data are isolated in localStorage namespaces.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile caption="Schema" value={STORAGE_SCHEMA_VERSION} />
            <StatTile caption="Namespace" value={storageLabel || "No workspace"} helper={storageNamespace || "guest"} />
            <StatTile caption="Transactions" value={transactions.length} />
            <StatTile caption="Budgets" value={budgets.length} />
          </div>

          <div className="flex flex-wrap gap-2">
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
              Clear workspace
            </Button>
          </div>
        </div>
      </Card>

      <StatusBanner tone="info" title="Security note">
        This is a frontend-only local app. Data remains on this device and can be read by anyone with browser/profile access.
      </StatusBanner>
    </div>
  );
}

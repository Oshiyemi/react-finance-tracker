import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import { useAuthStore } from "@/state/useAuthStore";
import { validateRegister } from "@/utils/validators";

export default function Register() {
  const {
    hasPendingGuestMigration,
    isAccount,
    isAuthLoading,
    isGuest,
    isReady,
    pendingGuestMigration,
    register,
    retryGuestMigration,
  } = useAuthStore();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [migrationState, setMigrationState] = useState("idle");
  const [migrationMessage, setMigrationMessage] = useState("");

  const shouldHoldOnPage = hasPendingGuestMigration || migrationState === "failed";

  useEffect(() => {
    if (isReady && isAccount && !shouldHoldOnPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAccount, isReady, navigate, shouldHoldOnPage]);

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (isGuest) {
      setMigrationState("migrating");
      setMigrationMessage("Migrating your data...");
    } else {
      setMigrationState("idle");
      setMigrationMessage("");
    }

    const result = await register(values);

    if (!result.ok) {
      setErrors({ form: result.message });
      setMigrationState("idle");
      setMigrationMessage("");
      return;
    }

    if (result.migration?.ok === false) {
      setMigrationState("failed");
      setMigrationMessage(result.migration.message || "Guest data migration failed.");
      return;
    }

    setMigrationState("success");
    setMigrationMessage(
      result.migration?.alreadyMigrated
        ? "Guest data was already linked to this account."
        : "Migration complete. Your guest data is now attached to your account."
    );
    navigate("/dashboard", { state: { migration: result.migration } });
  }

  async function handleRetryMigration() {
    setMigrationState("migrating");
    setMigrationMessage("Migrating your data...");

    const result = await retryGuestMigration();

    if (!result.ok) {
      setMigrationState("failed");
      setMigrationMessage(result.message);
      return;
    }

    setMigrationState("success");
    setMigrationMessage("Migration complete. Your guest data is now attached to your account.");
    navigate("/dashboard", { state: { migration: result.migration } });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl" padding="p-8" tone="highlight">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
              Create account
            </p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
              Open an account-mode workspace
            </h1>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your data stays local in this build, but account mode gives you a
              distinct workspace separate from guest activity.
            </p>
            {isGuest ? (
              <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                Guest data will be migrated to your account right after signup.
              </p>
            ) : null}
            {(migrationState === "migrating" || hasPendingGuestMigration) ? (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>
                    {migrationState === "migrating"
                      ? "Migrating your data..."
                      : "Migration is pending. Retry to finish importing your guest data."}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <Input
            id="register-name"
            label="Full name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={values.name}
            error={errors.name}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                name: event.target.value,
              }))
            }
          />

          <Input
            id="register-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={values.email}
            error={errors.email}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                email: event.target.value,
              }))
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              id="register-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={values.password}
              error={errors.password}
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  password: event.target.value,
                }))
              }
            />

            <Input
              id="register-confirm-password"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  confirmPassword: event.target.value,
                }))
              }
            />
          </div>

          {errors.form ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">{errors.form}</p>
          ) : null}
          {migrationState === "failed" ? (
            <div className="rounded-2xl border border-amber-300/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-semibold">Migration needs a retry</p>
              <p className="mt-1">
                {migrationMessage || pendingGuestMigration?.lastError || "Guest data is still safe in local storage."}
              </p>
              <div className="mt-3">
                <Button loading={isAuthLoading} onClick={handleRetryMigration} size="sm">
                  Retry migration
                </Button>
              </div>
            </div>
          ) : null}
          {migrationState === "success" ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{migrationMessage}</p>
          ) : null}

          <div className="space-y-3">
            <Button className="w-full" loading={isAuthLoading} size="lg" type="submit">
              {isGuest ? "Create account and migrate data" : "Create account"}
            </Button>
            <Button
              className="w-full"
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Back
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?
            <Link
              className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
              to="/auth/login"
            >
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

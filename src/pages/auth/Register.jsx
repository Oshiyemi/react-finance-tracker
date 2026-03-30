import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/auth/AuthFrame";
import Button from "@/components/common/Button";
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
      setMigrationMessage("Migrating guest data...");
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
        : "Guest data migrated successfully."
    );
    navigate("/dashboard", { state: { migration: result.migration } });
  }

  async function handleRetryMigration() {
    setMigrationState("migrating");
    setMigrationMessage("Migrating guest data...");

    const result = await retryGuestMigration();

    if (!result.ok) {
      setMigrationState("failed");
      setMigrationMessage(result.message);
      return;
    }

    setMigrationState("success");
    setMigrationMessage("Guest data migrated successfully.");
    navigate("/dashboard", { state: { migration: result.migration } });
  }

  return (
    <AuthFrame
      backTo="/auth"
      title="Create account"
      description="Create a dedicated finance workspace on this browser with your account details. Account mode stays separate from guest mode, and guest data can be migrated after signup when needed."
    >
      <form className="space-y-[1.4rem]" onSubmit={handleSubmit} noValidate>
        {isGuest ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Guest data will be migrated into your account after signup.
          </p>
        ) : null}

        {(migrationState === "migrating" || hasPendingGuestMigration) ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            <div className="flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>
                {migrationState === "migrating"
                  ? "Migrating guest data..."
                  : "Migration is pending. Retry to complete import."}
              </span>
            </div>
          </div>
        ) : null}

        <Input
          id="register-name"
          label="Full name"
          autoComplete="name"
          required
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
          required
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="register-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="8 to 128 chars"
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
            required
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
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{errors.form}</span>
          </p>
        ) : null}

        {migrationState === "failed" ? (
          <div className="rounded-xl border border-amber-300/80 bg-amber-50/80 px-3.5 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="font-semibold">Migration needs retry</p>
            <p className="mt-1">
              {migrationMessage || pendingGuestMigration?.lastError || "Guest data is still available locally."}
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

        <div className="space-y-3 pt-1.5">
          <Button className="w-full" loading={isAuthLoading} size="lg" type="submit">
            <UserPlus className="h-4 w-4" />
            {isGuest ? "Create account and migrate" : "Create account"}
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth/login")}
          >
            <LogIn className="h-4 w-4" />
            Login instead
          </Button>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?
          <Link
            className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import { useAuthStore } from "@/state/useAuthStore";
import { validateLogin } from "@/utils/validators";

export default function Login() {
  const { isAccount, isAuthLoading, isGuest, login, isReady } = useAuthStore();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isReady && isAccount) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAccount, isReady, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const result = await login(values);

    if (!result.ok) {
      setErrors({ form: result.message });
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl" padding="p-8" tone="highlight">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
              Account access
            </p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
              Log in to your local account workspace
            </h1>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              Sign in to switch out of guest mode and open your account-specific
              budget and transaction history.
            </p>
            {isGuest ? (
              <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                You are currently browsing as Guest. Logging in switches you to a
                separate workspace.
              </p>
            ) : null}
          </div>

          <Input
            id="login-email"
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

          <Input
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            value={values.password}
            error={errors.password}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                password: event.target.value,
              }))
            }
          />

          {errors.form ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">{errors.form}</p>
          ) : null}

          <div className="space-y-3">
            <Button className="w-full" loading={isAuthLoading} size="lg" type="submit">
              Login
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
            No account yet?
            <Link
              className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
              to="/auth/register"
            >
              Create one
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

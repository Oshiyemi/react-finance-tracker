import { useEffect, useState } from "react";
import { AlertTriangle, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/auth/AuthFrame";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuthStore } from "@/state/useAuthStore";
import { validateLogin } from "@/utils/validators";

export default function Login() {
  const { isAccount, isAuthLoading, isGuest, isReady, login } = useAuthStore();
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
    <AuthFrame
      backTo="/auth"
      title="Sign in"
      description="Sign in with your saved credentials to open your account workspace on this browser. Account mode stays separate from guest mode, keeping your records organized on this device."
    >
      <form className="space-y-[1.4rem]" onSubmit={handleSubmit} noValidate>
        {isGuest ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            You are in guest mode. Logging in switches to your account workspace.
          </p>
        ) : null}

        <Input
          id="login-email"
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

        <Input
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="8 to 128 characters"
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
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{errors.form}</span>
          </p>
        ) : null}

        <div className="space-y-3 pt-1.5">
          <Button className="w-full" loading={isAuthLoading} size="lg" type="submit">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth/register")}
          >
            <UserPlus className="h-4 w-4" />
            Create account instead
          </Button>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Need a new account?
          <Link
            className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

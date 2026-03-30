import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Analytics from "@/pages/Analytics";
import Budgets from "@/pages/Budgets";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Transactions from "@/pages/Transactions";
import AuthLanding from "@/pages/auth/AuthLanding";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Loader from "@/components/common/Loader";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/state/useAuthStore";

function RootRedirect() {
  const { hasSession, isReady } = useAuthStore();

  if (!isReady) {
    return <Loader label="Restoring your session..." />;
  }

  return <Navigate replace to={hasSession ? "/dashboard" : "/auth"} />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth" element={<AuthLanding />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

import { Navigate } from "react-router-dom";
import Loader from "@/components/common/Loader";
import { useAuthStore } from "@/state/useAuthStore";

export default function ProtectedRoute({ children }) {
  const { hasSession, isReady } = useAuthStore();

  if (!isReady) {
    return <Loader label="Restoring your session..." />;
  }

  if (!hasSession) {
    return <Navigate replace to="/auth" />;
  }

  return children;
}

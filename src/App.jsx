import GuestAccessBanner from "@/components/common/GuestAccessBanner";
import Navbar from "@/components/common/Navbar";
import AppRouter from "@/routes/AppRouter";
import { AppStoreProvider } from "@/state/useAppStore";
import { AuthProvider } from "@/state/useAuthStore";

export default function App() {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <Navbar />
        <GuestAccessBanner />
        <AppRouter />
      </AppStoreProvider>
    </AuthProvider>
  );
}

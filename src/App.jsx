import GuestAccessBanner from "@/components/common/GuestAccessBanner";
import Navbar from "@/components/common/Navbar";
import AppTutorialModal from "@/components/tutorial/AppTutorialModal";
import AppRouter from "@/routes/AppRouter";
import { AppStoreProvider } from "@/state/useAppStore";
import { AuthProvider } from "@/state/useAuthStore";

export default function App() {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[120] focus:rounded-lg focus:bg-emerald-700 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <Navbar />
        <GuestAccessBanner />
        <AppRouter />
        <AppTutorialModal />
      </AppStoreProvider>
    </AuthProvider>
  );
}

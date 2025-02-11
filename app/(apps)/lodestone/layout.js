import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { Toaster } from "@/components/ui/toaster";

export default function LodestoneLayout({ children }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </SettingsProvider>
  );
}

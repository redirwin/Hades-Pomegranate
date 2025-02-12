import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Lodestone - Hades Pomegranates",
  description: "Create and manage inventory lists for your RPG characters"
};

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

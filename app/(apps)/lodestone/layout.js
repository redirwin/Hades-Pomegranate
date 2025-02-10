import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

export default function LodestoneLayout({ children }) {
  return (
    <SettingsProvider>
      <AuthProvider>{children}</AuthProvider>
    </SettingsProvider>
  );
}

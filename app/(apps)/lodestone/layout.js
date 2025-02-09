import { AuthProvider } from "./context/AuthContext";

export default function LodestoneLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

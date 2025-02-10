"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

export default function Lodestone() {
  const { user, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      router.push("/lodestone/admin");
    } catch (error) {
      console.error("Error logging in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-xl font-bold">Lodestone</h1>
          <nav>
            {user ? (
              <Button variant="default" asChild>
                <Link href="/lodestone/admin">
                  <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {loading ? "Logging in..." : "Login"}
                </span>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 max-w-7xl mx-auto w-full h-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome to Lodestone
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground/90 mb-4">
            An RPG Resource Generator
          </h2>
          <p className="text-lg sm:text-xl text-foreground/80">
            Create and manage inventory lists for your RPG encounters.
          </p>
        </div>
      </main>
    </div>
  );
}

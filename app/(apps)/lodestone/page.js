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
    <div className="min-h-screen flex flex-col p-4 sm:p-8">
      <nav className="w-full flex justify-end mb-8">
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
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Welcome to Lodestone
        </h1>
        <p className="text-lg sm:text-xl text-foreground/80">
          Create and manage inventory lists for your RPG characters.
        </p>
      </main>
    </div>
  );
}

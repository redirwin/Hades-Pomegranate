"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      router.push("/admin");
    } catch (error) {
      console.error("Error logging in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative p-8">
      <nav className="absolute top-8 right-8">
        {user ? (
          <Link
            href="/admin"
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded transition-colors"
          >
            Admin
          </Link>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        )}
      </nav>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Our Site
        </h1>
        <p className="text-foreground/80">
          This is a public page accessible to everyone.
        </p>
      </main>
    </div>
  );
}

"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Admin() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded transition-colors"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <div>
        <p className="text-foreground">Welcome, {user.email}</p>
        {/* Add your admin dashboard content here */}
      </div>
    </div>
  );
}

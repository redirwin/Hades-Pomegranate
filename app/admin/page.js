"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Button variant="default" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="default" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      <div>
        <p className="text-foreground">Welcome, {user.email}</p>
        {/* Add your admin dashboard content here */}
      </div>
    </div>
  );
}

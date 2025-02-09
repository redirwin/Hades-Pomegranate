"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Plus } from "lucide-react";
import ResourceHubs from "./components/resource-hubs";
import Provisions from "./components/provisions";
import Settings from "./components/settings";
import { RarityProvider } from "../context/RarityContext";
import { Toaster } from "@/components/ui/toaster";

export default function Admin() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("hubs");
  const [showHubForm, setShowHubForm] = useState(false);
  const [showProvisionForm, setShowProvisionForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/lodestone");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/lodestone");
  };

  const handleAddClick = () => {
    if (activeTab === "hubs") {
      setShowHubForm(true);
    } else if (activeTab === "provisions") {
      setShowProvisionForm(true);
    }
  };

  if (!user) return null;

  return (
    <RarityProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Lodestone Admin</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Tabs
            defaultValue="hubs"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="sticky top-[57px] z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TabsList className="w-full justify-start p-0 h-12">
                <TabsTrigger value="hubs" className="flex-1">
                  📍 Resource Hubs
                </TabsTrigger>
                <TabsTrigger value="provisions" className="flex-1">
                  🎒 Provisions
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  ⚙️ Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4">
              <TabsContent value="hubs" className="m-0">
                <ResourceHubs
                  isFormOpen={showHubForm}
                  setIsFormOpen={setShowHubForm}
                />
              </TabsContent>
              <TabsContent value="provisions" className="m-0">
                <Provisions
                  isFormOpen={showProvisionForm}
                  setIsFormOpen={setShowProvisionForm}
                />
              </TabsContent>
              <TabsContent value="settings" className="m-0">
                <Settings />
              </TabsContent>
            </div>
          </Tabs>
        </main>

        {/* Floating Add Button - Hide in settings tab */}
        {activeTab !== "settings" && (
          <Button
            size="icon"
            className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
            onClick={handleAddClick}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>
      <Toaster />
    </RarityProvider>
  );
}

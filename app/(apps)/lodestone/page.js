"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LayoutDashboard,
  Wand2,
  History,
  Trash2,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { usePublicResourceHubs } from "./hooks/usePublicResourceHubs";
import { useToast } from "@/hooks/use-toast";
import { useListHistory } from "./hooks/useListHistory";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";

const RARITY_ORDER = {
  Junk: 0,
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  "Very Rare": 4,
  Legendary: 5,
  Artifact: 6,
  Wondrous: 7,
  Varies: 8
};

const sortItems = (items) => {
  return [...items].sort((a, b) => {
    const rarityDiff =
      (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;

    return a.name.localeCompare(b.name);
  });
};

export default function Lodestone() {
  const { user, googleLogin } = useAuth();
  const { resourceHubs, loading, error } = usePublicResourceHubs();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHub, setSelectedHub] = useState("");
  const [generatedList, setGeneratedList] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const { history, addToHistory, clearHistory } = useListHistory();
  const [previewImage, setPreviewImage] = useState(null);

  const handleGoogleLogin = async () => {
    setIsLoginLoading(true);
    try {
      const result = await googleLogin();
      if (!result.success) {
        toast({
          title: "Access Denied",
          description: "Only administrators are allowed to log in.",
          variant: "destructive",
          duration: 5000
        });
      } else {
        // Redirect to admin page on successful login
        router.push("/lodestone/admin");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedHub) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/lodestone/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hubId: selectedHub })
      });

      if (!response.ok) {
        throw new Error("Failed to generate list");
      }

      const data = await response.json();

      // Log the rarity distribution
      const rarityCounts = data.items.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + item.count;
        return acc;
      }, {});

      setGeneratedList(data);
      addToHistory(data);
    } catch (error) {
      console.error("Failed to generate list:", error);
      toast({
        title: "Error",
        description: "Failed to generate list",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageClick = (imageUrl, altText) => {
    if (imageUrl) {
      setPreviewImage({ url: imageUrl, alt: altText });
    }
  };

  // Sort the hubs alphabetically before rendering in the Select
  const sortedHubs = resourceHubs.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-center gap-4 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Image
            src="/compass.webp"
            alt="Compass"
            width={30}
            height={30}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold">Lodestone</h1>
          <div className="ml-auto">
            <nav>
              {user ? (
                <Button variant="default" asChild>
                  <Link href="/lodestone/admin">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <span>Admin</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleGoogleLogin}
                  disabled={isLoginLoading}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>{isLoginLoading ? "Logging in..." : "Login"}</span>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <Toaster />
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome to Lodestone
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground/90 mb-4">
            An RPG Resource Generator
          </h2>
          <p className="text-lg sm:text-xl text-foreground/80 mb-8 text-center">
            Create and manage inventory lists for your RPG encounters.
          </p>
        </div>

        <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-[#D4C4B4] sm:bg-transparent sm:p-0 sm:mb-8 sm:max-w-xl sm:mx-auto w-full z-50 shadow-[0_-2px_4px_rgba(0,0,0,0.1)] sm:shadow-none">
          <div className="flex justify-center gap-4 w-full">
            <Select value={selectedHub} onValueChange={setSelectedHub}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Choose a resource hub" />
              </SelectTrigger>
              <SelectContent>
                {sortedHubs.map((hub) => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedHub || isGenerating}
              onClick={handleGenerate}
            >
              <Wand2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isGenerating ? "Generating..." : "Generate List"}
              </span>
            </Button>
          </div>
        </div>

        <div className="pb-20 sm:pb-0 flex flex-col items-center sm:items-start max-w-xl mx-auto">
          {generatedList && (
            <div className="w-full border rounded-lg p-6 space-y-4 relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {generatedList.hubImage ? (
                      <img
                        src={generatedList.hubImage}
                        alt={generatedList.hubName}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleImageClick(
                            generatedList.hubImage,
                            generatedList.hubName
                          )
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {generatedList.hubName} - Generated List
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGeneratedList(null)}
                  className="h-8 w-8 -mt-2 -mr-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {sortItems(generatedList.items).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              handleImageClick(item.imageUrl, item.name)
                            }
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium">
                          {item.count} {item.name}
                          {item.count > 1 ? "s" : ""}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {item.rarity}
                        </p>
                      </div>
                    </div>
                    <span className="text-primary font-medium">
                      {item.price} gp each
                    </span>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t font-bold">
                  <div className="flex justify-between items-center">
                    <div>
                      Total Items:{" "}
                      {generatedList.items.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                    <div className="text-primary">
                      Total Value:{" "}
                      {generatedList.items
                        .reduce((sum, item) => sum + item.price * item.count, 0)
                        .toFixed(2)}{" "}
                      gp
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="w-full flex justify-center mt-4">
              <Button variant="default" onClick={() => setShowHistory(true)}>
                <History className="h-4 w-4 mr-2" />
                <span>View History</span>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center pr-8">
              <DialogTitle>List History</DialogTitle>
              <Button
                variant="default"
                size="default"
                onClick={() => {
                  clearHistory();
                  setShowHistory(false);
                  setGeneratedList(null);
                }}
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear History</span>
              </Button>
            </div>
          </DialogHeader>

          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No history available
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {history.map((list, index) => (
                <AccordionItem key={list.timestamp} value={list.timestamp}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                          {list.hubImage ? (
                            <img
                              src={list.hubImage}
                              alt={list.hubName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                        <span>{list.hubName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(list.timestamp), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {sortItems(list.items).map((item, itemIndex) => (
                        <div
                          key={`${item.id}-${itemIndex}`}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium">
                                {item.count} {item.name}
                                {item.count > 1 ? "s" : ""}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {item.rarity}
                              </p>
                            </div>
                          </div>
                          <span className="text-primary font-medium">
                            {item.price} gp each
                          </span>
                        </div>
                      ))}

                      <div className="mt-6 pt-4 border-t font-bold">
                        <div className="flex justify-between items-center">
                          <div>
                            Total Items:{" "}
                            {list.items.reduce(
                              (sum, item) => sum + item.count,
                              0
                            )}
                          </div>
                          <div className="text-primary">
                            Total Value:{" "}
                            {list.items
                              .reduce(
                                (sum, item) => sum + item.price * item.count,
                                0
                              )
                              .toFixed(2)}{" "}
                            gp
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div
              className="relative aspect-square sm:aspect-video w-full cursor-pointer"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage.url}
                alt={previewImage.alt}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

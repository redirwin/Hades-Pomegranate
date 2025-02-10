"use client";

import RaritySettings from "./rarity-settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Settings() {
  const { settings, toggleDeletionConfirmation } = useSettings();
  const { toast } = useToast();
  const [remainingMinutes, setRemainingMinutes] = useState(null);

  // Calculate and update remaining time
  useEffect(() => {
    if (
      !settings.showDeletionConfirmation &&
      settings.deletionConfirmationDisabledAt
    ) {
      const updateRemainingTime = () => {
        const disabledTime = new Date(
          settings.deletionConfirmationDisabledAt
        ).getTime();
        const currentTime = new Date().getTime();
        const elapsedMs = currentTime - disabledTime;
        const remainingMs = Math.max(5 * 60 * 1000 - elapsedMs, 0);
        const minutes = Math.floor(remainingMs / (60 * 1000));
        const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
        setRemainingMinutes({ minutes, seconds });
      };

      // Update immediately and then every second
      updateRemainingTime();
      const intervalId = setInterval(updateRemainingTime, 1000);

      return () => clearInterval(intervalId);
    } else {
      setRemainingMinutes(null);
    }
  }, [
    settings.showDeletionConfirmation,
    settings.deletionConfirmationDisabledAt
  ]);

  const handleToggleConfirmation = async (checked) => {
    try {
      await toggleDeletionConfirmation(checked);
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure global settings for Lodestone
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="rarity-settings" className="border-none">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <div className="space-y-0.5 text-left">
                    <h2 className="text-lg font-medium">Rarity Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Configure spawn weights for each rarity level
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    <RaritySettings />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-medium">Deletion Confirmation</h2>
                <p className="text-sm text-muted-foreground">
                  {settings.showDeletionConfirmation
                    ? "Show a confirmation dialog when deleting items"
                    : remainingMinutes
                    ? `Confirmation will be re-enabled in ${
                        remainingMinutes.minutes
                      } ${
                        remainingMinutes.minutes === 1 ? "minute" : "minutes"
                      } and ${remainingMinutes.seconds} ${
                        remainingMinutes.seconds === 1 ? "second" : "seconds"
                      }.`
                    : "Delete confirmation disabled"}
                </p>
              </div>
              <Switch
                checked={settings.showDeletionConfirmation}
                onCheckedChange={handleToggleConfirmation}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

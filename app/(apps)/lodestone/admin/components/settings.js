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

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const handleToggleConfirmation = async (checked) => {
    try {
      await updateSettings({
        ...settings,
        showDeletionConfirmation: checked
      });
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
                  Rarity Settings
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
                  Show a confirmation dialog when deleting items
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

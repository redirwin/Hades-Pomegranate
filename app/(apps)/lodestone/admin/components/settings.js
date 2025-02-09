"use client";

import RaritySettings from "./rarity-settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure global settings for Lodestone
          </p>
        </div>

        <div className="border-t pt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="rarity-settings">
              <AccordionTrigger>Rarity Settings</AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <RaritySettings />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

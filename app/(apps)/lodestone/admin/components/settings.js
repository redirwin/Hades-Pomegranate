"use client";

import RaritySettings from "./rarity-settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
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
        {/* Add more setting cards here as needed */}
      </div>
    </div>
  );
}

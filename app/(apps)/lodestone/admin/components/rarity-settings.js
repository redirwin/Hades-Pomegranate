"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRarity } from "../../context/RarityContext";

export default function RaritySettings() {
  const { rarityOptions, setRarityOptions } = useRarity();

  const handleUpdateWeight = (index, value) => {
    const newOptions = [...rarityOptions];
    newOptions[index] = {
      ...newOptions[index],
      weight: value === "random" ? value : Number(value)
    };
    setRarityOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rarityOptions.map((rarity, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <div className="text-sm py-2 px-3 rounded-md bg-muted">
                    {rarity.value}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <Input
                    value={rarity.weight}
                    onChange={(e) => handleUpdateWeight(index, e.target.value)}
                    type={rarity.weight === "random" ? "text" : "number"}
                    min={0}
                    disabled={rarity.weight === "random"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Higher weights mean the item appears more frequently. The "Varies"
        rarity uses random weights and cannot be modified.
      </p>
    </div>
  );
}

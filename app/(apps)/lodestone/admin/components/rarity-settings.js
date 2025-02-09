"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRarity } from "../../context/RarityContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function RaritySettings() {
  const { rarityOptions, updateRarityOptions, loading, error } = useRarity();
  const { toast } = useToast();
  const [localOptions, setLocalOptions] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalOptions(rarityOptions);
  }, [rarityOptions]);

  const handleUpdateWeight = (index, value) => {
    const newOptions = [...localOptions];
    newOptions[index] = {
      ...newOptions[index],
      weight: value
    };
    setLocalOptions(newOptions);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      const processedOptions = localOptions.map((option) => ({
        ...option,
        weight:
          option.weight === "random"
            ? "random"
            : Number(String(option.weight).replace(/^0+/, "") || 0)
      }));

      await updateRarityOptions(processedOptions);
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Rarity settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rarity settings",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading rarity settings...</div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive">Error loading rarity settings</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {localOptions.map((rarity, index) => (
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
                    type="text"
                    disabled={rarity.weight === "random"}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Higher weights mean the item appears more frequently. The "Varies"
        rarity uses random weights and cannot be modified.
      </p>
    </div>
  );
}

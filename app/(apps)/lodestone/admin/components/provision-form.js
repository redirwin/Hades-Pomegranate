"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRarity } from "../../context/RarityContext";

export default function ProvisionForm({
  open,
  onOpenChange,
  initialData = null
}) {
  const { rarityOptions } = useRarity();
  const [formData, setFormData] = useState({
    name: "",
    basePrice: 0,
    rarity: "Common",
    selectedHubs: []
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        basePrice: initialData.basePrice,
        rarity: initialData.rarity,
        selectedHubs: initialData.selectedHubs
      });
    } else {
      setFormData({
        name: "",
        basePrice: 0,
        rarity: "Common",
        selectedHubs: []
      });
    }
  }, [initialData]);

  // Temporary mock data for hubs
  const availableHubs = [
    { id: 1, name: "Forest Loot" },
    { id: 2, name: "Dungeon Treasures" },
    { id: 3, name: "City Market" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Provision" : "New Provision"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Provision Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter provision name"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Button type="button" variant="outline" className="w-full">
                  Upload Image
                </Button>
              </div>
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Price (Gold)</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: parseFloat(e.target.value) || 0
                  })
                }
              />
            </div>

            {/* Rarity Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rarity (Spawn Weight)
              </label>
              <Select
                value={formData.rarity}
                onValueChange={(value) =>
                  setFormData({ ...formData, rarity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  {rarityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value} ({option.weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Higher weights mean the item appears more frequently
              </p>
            </div>

            {/* Resource Hubs Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Available in Resource Hubs
              </label>
              <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {availableHubs.map((hub) => (
                  <div key={hub.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hub-${hub.id}`}
                      checked={formData.selectedHubs.includes(hub.id)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          selectedHubs: checked
                            ? [...formData.selectedHubs, hub.id]
                            : formData.selectedHubs.filter(
                                (id) => id !== hub.id
                              )
                        });
                      }}
                    />
                    <label
                      htmlFor={`hub-${hub.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {hub.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update" : "Create"} Provision
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

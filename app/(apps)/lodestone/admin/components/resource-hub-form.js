"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ResourceHubForm({
  open,
  onOpenChange,
  initialData = null
}) {
  const [formData, setFormData] = useState({
    name: "",
    upperPriceModifier: 20,
    lowerPriceModifier: 20,
    minProvisions: 1,
    maxProvisions: 5,
    selectedProvisions: []
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        upperPriceModifier: initialData.upperPriceModifier,
        lowerPriceModifier: initialData.lowerPriceModifier,
        minProvisions: initialData.minProvisions,
        maxProvisions: initialData.maxProvisions,
        selectedProvisions: initialData.selectedProvisions
      });
    } else {
      setFormData({
        name: "",
        upperPriceModifier: 20,
        lowerPriceModifier: 20,
        minProvisions: 1,
        maxProvisions: 5,
        selectedProvisions: []
      });
    }
  }, [initialData]);

  // Temporary mock data for provisions
  const availableProvisions = [
    { id: 1, name: "Health Potion" },
    { id: 2, name: "Ancient Scroll" },
    { id: 3, name: "Magic Sword" }
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
            {initialData ? "Edit Resource Hub" : "New Resource Hub"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hub Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter hub name"
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

            {/* Price Modifiers */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upper Price Modifier (%)
                </label>
                <Slider
                  value={[formData.upperPriceModifier]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, upperPriceModifier: value })
                  }
                  max={100}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.upperPriceModifier}%
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Lower Price Modifier (%)
                </label>
                <Slider
                  value={[formData.lowerPriceModifier]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, lowerPriceModifier: value })
                  }
                  max={100}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.lowerPriceModifier}%
                </span>
              </div>
            </div>

            {/* Provision Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Provisions</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.minProvisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minProvisions: parseInt(e.target.value)
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Provisions</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.maxProvisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxProvisions: parseInt(e.target.value)
                    })
                  }
                />
              </div>
            </div>

            {/* Provisions Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Available Provisions
              </label>
              <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {availableProvisions.map((provision) => (
                  <div
                    key={provision.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`provision-${provision.id}`}
                      checked={formData.selectedProvisions.includes(
                        provision.id
                      )}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          selectedProvisions: checked
                            ? [...formData.selectedProvisions, provision.id]
                            : formData.selectedProvisions.filter(
                                (id) => id !== provision.id
                              )
                        });
                      }}
                    />
                    <label
                      htmlFor={`provision-${provision.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {provision.name}
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
              {initialData ? "Update" : "Create"} Hub
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

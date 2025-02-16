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
import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useResourceHubs } from "../../context/ResourceHubContext";
import { useProvisions } from "../../context/ProvisionContext";
import { X } from "lucide-react";
import { capitalizeWords } from "../../utils/text";
import { useImageHandler } from "../../hooks/use-image-handler";

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

const rarityColors = {
  Junk: "text-gray-500",
  Common: "text-green-600",
  Uncommon: "text-cyan-600",
  Rare: "text-blue-600",
  "Very Rare": "text-purple-600",
  Legendary: "text-yellow-600",
  Artifact: "text-red-600",
  Wondrous: "text-fuchsia-600",
  Varies: "text-orange-600"
};

export default function ResourceHubForm({
  open,
  onOpenChange,
  initialData = null
}) {
  const { addResourceHub, updateResourceHub } = useResourceHubs();
  const { provisions, updateProvision } = useProvisions();
  const { toast } = useToast();
  const {
    imageFile,
    imagePreview,
    handleImageSelect,
    handleImageDelete: baseHandleImageDelete,
    handleImageUpload,
    resetImage,
    setImagePreview
  } = useImageHandler(initialData?.imageUrl);
  const fileInputRef = useRef(null);

  // Move formData initialization outside useEffect
  const initialFormState = {
    name: "",
    description: "",
    minProvisions: 1,
    maxProvisions: 5,
    selectedProvisions: [],
    imageUrl: "",
    upperPriceModifier: 0,
    lowerPriceModifier: 0
  };

  const [formData, setFormData] = useState(initialData || initialFormState);

  useEffect(() => {
    if (!open) {
      resetImage();
      setFormData(initialFormState);
    } else if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl);
    }
  }, [open, initialData]); // Remove setFormData and other function dependencies

  const handleImageDelete = async () => {
    try {
      const updatedData = await baseHandleImageDelete(
        formData,
        initialData,
        updateResourceHub
      );
      setFormData(updatedData);
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Hub name is required",
        variant: "destructive"
      });
      return;
    }

    // Validate min/max provisions
    if (
      formData.minProvisions < 0 ||
      formData.maxProvisions < formData.minProvisions
    ) {
      toast({
        title: "Error",
        description:
          "Invalid provision range. Maximum must be greater than or equal to minimum.",
        variant: "destructive"
      });
      return;
    }

    try {
      const imageUrl = await handleImageUpload(
        formData,
        initialData,
        "resource-hubs"
      );

      const dataToSave = {
        ...formData,
        name: capitalizeWords(formData.name),
        imageUrl
      };

      if (initialData) {
        await updateResourceHub(initialData.id, dataToSave);
        toast({
          title: "Success",
          description: "Resource hub updated successfully"
        });
      } else {
        // Create the new resource hub first
        const newDocRef = await addResourceHub(dataToSave);

        // Then update all selected provisions to include this new hub
        const updateProvisionPromises = provisions
          .filter((provision) =>
            formData.selectedProvisions.includes(provision.id)
          )
          .map((provision) => {
            const newSelectedHubs = [
              ...(provision.selectedHubs || []),
              newDocRef.id
            ];
            return updateProvision(provision.id, {
              ...provision,
              selectedHubs: newSelectedHubs
            });
          });

        // Wait for all provision updates to complete
        await Promise.all(updateProvisionPromises);

        toast({
          title: "Success",
          description: "Resource hub created successfully"
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: initialData
          ? "Failed to update resource hub"
          : "Failed to create resource hub",
        variant: "destructive"
      });
    }
  };

  const handleProvisionToggle = async (provisionId, checked) => {
    try {
      const newSelectedProvisions = checked
        ? [...formData.selectedProvisions, provisionId]
        : formData.selectedProvisions.filter((id) => id !== provisionId);

      // Update local state
      setFormData({
        ...formData,
        selectedProvisions: newSelectedProvisions
      });

      // If editing an existing hub, update both sides of the relationship
      if (initialData?.id) {
        const provision = provisions.find((p) => p.id === provisionId);
        if (provision) {
          const newSelectedHubs = checked
            ? [...(provision.selectedHubs || []), initialData.id]
            : (provision.selectedHubs || []).filter(
                (id) => id !== initialData.id
              );

          // Update both documents in Firestore
          await Promise.all([
            updateProvision(provisionId, {
              ...provision,
              selectedHubs: newSelectedHubs
            }),
            updateResourceHub(initialData.id, {
              ...formData,
              selectedProvisions: newSelectedProvisions
            })
          ]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update relationship",
        variant: "destructive"
      });
    }
  };

  // Update the sorting logic
  const sortedProvisions = provisions.sort((a, b) => {
    // First sort by rarity
    const rarityDiff =
      (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;
    // Then sort alphabetically within same rarity
    return a.name.localeCompare(b.name);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Resource Hub" : "New Resource Hub"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              <div className="border-2 border-dashed rounded-lg p-4 space-y-4">
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleImageDelete}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
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
                <p className="text-sm text-muted-foreground">
                  Items can cost up to {formData.upperPriceModifier}% more
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Items can cost up to {formData.lowerPriceModifier}% less
                </p>
              </div>
            </div>

            {/* Provision Range */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Resources</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minProvisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minProvisions: parseInt(e.target.value)
                    })
                  }
                  placeholder="Enter minimum Resources"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Resources</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.maxProvisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxProvisions: parseInt(e.target.value)
                    })
                  }
                  placeholder="Enter maximum resources"
                />
              </div>
            </div>

            {/* Provisions Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Resources</label>
              <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {sortedProvisions.map((provision) => (
                  <div
                    key={provision.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`provision-${provision.id}`}
                      checked={formData.selectedProvisions.includes(
                        provision.id
                      )}
                      onCheckedChange={(checked) =>
                        handleProvisionToggle(provision.id, checked)
                      }
                    />
                    <label
                      htmlFor={`provision-${provision.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {capitalizeWords(provision.name)}{" "}
                      <span
                        className={`${rarityColors[provision.rarity]} ml-1`}
                      >
                        ({provision.rarity})
                      </span>
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
              {initialData ? "Update Hub" : "Create Hub"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

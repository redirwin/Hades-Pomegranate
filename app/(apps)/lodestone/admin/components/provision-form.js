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
import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProvisions } from "../../context/ProvisionContext";
import { useRarity } from "../../context/RarityContext";
import { useResourceHubs } from "../../context/ResourceHubContext";
import { uploadImage, deleteImage } from "../../firebase/storage";
import { X } from "lucide-react";
import { capitalizeWords } from "../../utils/text";
import { processImage } from "../../utils/image-processing";

export default function ProvisionForm({
  open,
  onOpenChange,
  initialData = null
}) {
  const { addProvision, updateProvision } = useProvisions();
  const { resourceHubs, updateResourceHub } = useResourceHubs();
  const { rarityOptions } = useRarity();
  const { toast } = useToast();
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      basePrice: 0,
      rarity: "",
      selectedHubs: [],
      imageUrl: "",
      imageFile: null
    }
  );
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFormData(
        initialData || {
          name: "",
          basePrice: 0,
          rarity: "",
          selectedHubs: [],
          imageUrl: "",
          imageFile: null
        }
      );
    } else if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl || null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Resource name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.basePrice === undefined || formData.basePrice < 0) {
      toast({
        title: "Error",
        description: "Base price is required and must be non-negative",
        variant: "destructive"
      });
      return;
    }

    if (!formData.rarity) {
      toast({
        title: "Error",
        description: "Rarity is required",
        variant: "destructive"
      });
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        if (initialData?.imageUrl) {
          await deleteImage(initialData.imageUrl);
        }
        const path = `provisions/${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      const dataToSave = {
        ...formData,
        name: capitalizeWords(formData.name),
        imageUrl
      };

      if (initialData) {
        await updateProvision(initialData.id, dataToSave);
      } else {
        await addProvision(dataToSave);
      }
      onOpenChange(false);
      toast({
        title: "Success",
        description: initialData
          ? "Resource updated successfully"
          : "Resource created successfully"
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: initialData
          ? "Failed to update resource"
          : "Failed to create resource",
        variant: "destructive"
      });
    }
  };

  const handleHubToggle = async (hubId, checked) => {
    try {
      const newSelectedHubs = checked
        ? [...formData.selectedHubs, hubId]
        : formData.selectedHubs.filter((id) => id !== hubId);

      setFormData({
        ...formData,
        selectedHubs: newSelectedHubs
      });

      if (initialData?.id) {
        const hub = resourceHubs.find((h) => h.id === hubId);
        if (hub) {
          const newSelectedProvisions = checked
            ? [...(hub.selectedProvisions || []), initialData.id]
            : (hub.selectedProvisions || []).filter(
                (id) => id !== initialData.id
              );

          await Promise.all([
            updateResourceHub(hubId, {
              ...hub,
              selectedProvisions: newSelectedProvisions
            }),
            updateProvision(initialData.id, {
              ...formData,
              selectedHubs: newSelectedHubs
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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (imagePreview && !formData.imageUrl) {
          URL.revokeObjectURL(imagePreview);
        }

        // Process the image before setting it
        const processedFile = await processImage(file);
        setImageFile(processedFile);

        // Create preview of the processed image
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(processedFile);

        toast({
          title: "Success",
          description: "Image processed successfully"
        });
      } catch (error) {
        console.error("Error processing image:", error);
        toast({
          title: "Error",
          description: "Failed to process image",
          variant: "destructive"
        });
      }
    }
  };

  const handleImageDelete = async () => {
    try {
      if (formData.imageUrl) {
        await deleteImage(formData.imageUrl);
      } else if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setFormData({
        ...formData,
        imageUrl: "",
        imageFile: null
      });
      setImagePreview(null);

      if (initialData?.id) {
        await updateProvision(initialData.id, {
          ...formData,
          imageUrl: ""
        });
        toast({
          title: "Success",
          description: "Image removed successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    }
  };

  const sortedHubs = resourceHubs.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Resource" : "New Resource"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter resource name"
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
                  id="image-upload"
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

            {/* Base Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Price (Gold)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: parseFloat(e.target.value)
                  })
                }
                placeholder="Enter base price"
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
                  <SelectValue placeholder="Choose rarity" />
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
                {sortedHubs.map((hub) => (
                  <div key={hub.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hub-${hub.id}`}
                      checked={formData.selectedHubs.includes(hub.id)}
                      onCheckedChange={(checked) =>
                        handleHubToggle(hub.id, checked)
                      }
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
              {initialData ? "Update" : "Create"} Resource
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

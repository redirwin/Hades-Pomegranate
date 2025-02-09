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

export default function ProvisionForm({
  open,
  onOpenChange,
  initialData = null
}) {
  const { addProvision, updateProvision } = useProvisions();
  const { resourceHubs, updateResourceHub } = useResourceHubs();
  const { rarityOptions } = useRarity();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    basePrice: 0,
    rarity: "Common",
    selectedHubs: [],
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        basePrice: initialData.basePrice,
        rarity: initialData.rarity,
        selectedHubs: initialData.selectedHubs || [],
        imageUrl: initialData.imageUrl || ""
      });
      setImagePreview(initialData.imageUrl || null);
    } else {
      setFormData({
        name: "",
        basePrice: 0,
        rarity: "Common",
        selectedHubs: [],
        imageUrl: ""
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        // If updating and there's an existing image, delete it first
        if (initialData?.imageUrl) {
          await deleteImage(initialData.imageUrl);
        }
        // Upload the new image
        const path = `provisions/${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      const dataToSave = {
        ...formData,
        imageUrl
      };

      if (initialData) {
        await updateProvision(initialData.id, dataToSave);
        toast({
          title: "Success",
          description: "Resource updated successfully"
        });
      } else {
        // Create the new resource first
        const newDocRef = await addProvision(dataToSave);

        // Then update all selected resource hubs to include this new resource
        const updateHubPromises = resourceHubs
          .filter((hub) => formData.selectedHubs.includes(hub.id))
          .map((hub) => {
            const newSelectedProvisions = [
              ...(hub.selectedProvisions || []),
              newDocRef.id
            ];
            return updateResourceHub(hub.id, {
              ...hub,
              selectedProvisions: newSelectedProvisions
            });
          });

        // Wait for all hub updates to complete
        await Promise.all(updateHubPromises);

        toast({
          title: "Success",
          description: "Resource created successfully"
        });
      }
      onOpenChange(false);
    } catch (error) {
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

      // Update local state
      setFormData({
        ...formData,
        selectedHubs: newSelectedHubs
      });

      // If editing an existing resource, update both sides of the relationship
      if (initialData?.id) {
        const hub = resourceHubs.find((h) => h.id === hubId);
        if (hub) {
          const newSelectedProvisions = checked
            ? [...(hub.selectedProvisions || []), initialData.id]
            : (hub.selectedProvisions || []).filter(
                (id) => id !== initialData.id
              );

          // Update both documents in Firestore
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreview && !formData.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
        imageUrl: ""
      });
      setImagePreview(null);
      setImageFile(null);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Resource" : "New Resource"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                {resourceHubs.map((hub) => (
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

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
import { uploadImage, deleteImage } from "../../firebase/storage";
import { X } from "lucide-react";

export default function ResourceHubForm({
  open,
  onOpenChange,
  initialData = null
}) {
  const { addResourceHub, updateResourceHub } = useResourceHubs();
  const { provisions, updateProvision } = useProvisions();
  const { toast } = useToast();
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      minProvisions: 1,
      maxProvisions: 5,
      selectedProvisions: [],
      imageUrl: "",
      imageFile: null
    }
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Reset form when dialog closes or when initialData changes
  useEffect(() => {
    if (!open) {
      // Reset form to initial state when dialog closes
      setFormData(
        initialData || {
          name: "",
          description: "",
          minProvisions: 1,
          maxProvisions: 5,
          selectedProvisions: [],
          imageUrl: "",
          imageFile: null
        }
      );
    } else if (initialData) {
      // Set form data when editing
      setFormData(initialData);
    }
  }, [open, initialData]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      // If it's an existing image (has a URL), delete from storage
      if (formData.imageUrl) {
        await deleteImage(formData.imageUrl);
      }
      // If it's just a preview, revoke the object URL
      else if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Update form data
      setFormData({
        ...formData,
        imageUrl: ""
      });
      // Update preview state
      setImagePreview(null);
      setImageFile(null);

      // If editing, update the resource hub without the image
      if (initialData?.id) {
        await updateResourceHub(initialData.id, {
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
        const path = `resource-hubs/${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      const dataToSave = {
        ...formData,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Resource Hub" : "New Resource Hub"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="text-sm font-medium">
                  Minimum Provisions
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.minProvisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minProvisions: parseInt(e.target.value) || 1
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Maximum Provisions
                </label>
                <Input
                  type="number"
                  min={formData.minProvisions}
                  value={formData.maxProvisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxProvisions:
                        parseInt(e.target.value) || formData.minProvisions
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
                {provisions.map((provision) => (
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
              {initialData ? "Update Hub" : "Create Hub"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

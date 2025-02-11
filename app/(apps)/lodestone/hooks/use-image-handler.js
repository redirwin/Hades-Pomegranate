import { useState } from "react";
import { processImage } from "../utils/image-processing";
import { uploadImage, deleteImage } from "../firebase/storage";
import { useToast } from "@/hooks/use-toast";

export function useImageHandler(initialImageUrl = "") {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
  const { toast } = useToast();

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (imagePreview && !initialImageUrl) {
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

  const handleImageDelete = async (formData, initialData, updateFunction) => {
    try {
      // If it's an existing image (has a URL), delete from storage
      if (formData.imageUrl) {
        await deleteImage(formData.imageUrl);
      }
      // If it's just a preview, revoke the object URL
      else if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Update form data without image
      const updatedData = {
        ...formData,
        imageUrl: ""
      };

      // Update preview state
      setImagePreview(null);
      setImageFile(null);

      // If editing, update the item without the image
      if (initialData?.id) {
        await updateFunction(initialData.id, updatedData);
        toast({
          title: "Success",
          description: "Image removed successfully"
        });
      }

      return updatedData;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleImageUpload = async (formData, initialData, folderPath) => {
    let imageUrl = formData.imageUrl;

    if (imageFile) {
      // If updating and there's an existing image, delete it first
      if (initialData?.imageUrl) {
        await deleteImage(initialData.imageUrl);
      }
      // Upload the new image
      const path = `${folderPath}/${Date.now()}-${imageFile.name}`;
      imageUrl = await uploadImage(imageFile, path);
    }

    return imageUrl;
  };

  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return {
    imageFile,
    imagePreview,
    handleImageSelect,
    handleImageDelete,
    handleImageUpload,
    resetImage,
    setImagePreview,
    setImageFile
  };
}

import imageCompression from "browser-image-compression";

export async function processImage(file, options = {}) {
  const defaultOptions = {
    maxSizeMB: 0.5, // Maximum file size in MB
    maxWidthOrHeight: 250, // Maximum width/height in pixels
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8
  };

  const compressionOptions = {
    ...defaultOptions,
    ...options
  };

  try {
    // Compress and convert the image
    const compressedFile = await imageCompression(file, compressionOptions);

    // Create a new File object with .webp extension
    const convertedFile = new File(
      [compressedFile],
      `${file.name.split(".")[0]}.webp`,
      { type: "image/webp" }
    );

    return convertedFile;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

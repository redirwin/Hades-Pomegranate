import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

export async function uploadImage(file, path) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
}

export async function deleteImage(imageUrl) {
  try {
    if (!imageUrl) return;

    // Extract the path from the Firebase Storage URL
    const storageRef = ref(storage, getPathFromURL(imageUrl));
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw error;
  }
}

// Helper function to extract path from Firebase Storage URL
function getPathFromURL(url) {
  try {
    // Firebase Storage URLs contain '/o/' followed by the path
    const pathStartIndex = url.indexOf("/o/") + 3;
    const pathEndIndex = url.indexOf("?");
    let path = url.substring(pathStartIndex, pathEndIndex);
    // Firebase URLs encode path segments, so decode them
    path = decodeURIComponent(path);
    return path;
  } catch (error) {
    console.error("Failed to parse image URL:", error);
    throw error;
  }
}

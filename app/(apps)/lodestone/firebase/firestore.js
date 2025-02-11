import { db, storage } from "./config";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Rarity Settings
export const updateRaritySettings = async (rarityOptions) => {
  try {
    const docRef = doc(db, "settings", "rarity");
    await updateDoc(docRef, { options: rarityOptions });
  } catch (error) {
    console.error("Failed to update rarity settings:", error);
    throw error;
  }
};

export const getRaritySettings = async () => {
  try {
    const docRef = doc(db, "settings", "rarity");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        return doc.data().options;
      }
      return null;
    });
    return unsubscribe;
  } catch (error) {
    console.error("Failed to fetch rarity settings:", error);
    throw error;
  }
};

// Provisions
export const getProvisions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "provisions"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Failed to fetch provisions:", error);
    throw error;
  }
};

export const addProvision = async (provision, imageFile) => {
  try {
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `provisions/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, "provisions"), {
      ...provision,
      image: imageUrl,
      createdAt: new Date()
    });

    return { id: docRef.id, ...provision, image: imageUrl };
  } catch (error) {
    console.error("Failed to add provision:", error);
    throw error;
  }
};

export const updateProvision = async (id, provision, imageFile) => {
  try {
    let imageUrl = provision.image;
    if (imageFile) {
      const storageRef = ref(storage, `provisions/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "provisions", id), {
      ...provision,
      image: imageUrl,
      updatedAt: new Date()
    });

    return { id, ...provision, image: imageUrl };
  } catch (error) {
    console.error("Failed to update provision:", error);
    throw error;
  }
};

export const deleteProvision = async (id) => {
  try {
    await deleteDoc(doc(db, "provisions", id));
    return id;
  } catch (error) {
    console.error("Failed to delete provision:", error);
    throw error;
  }
};

// Resource Hubs
export const getResourceHubs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "resourceHubs"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Failed to fetch resource hubs:", error);
    throw error;
  }
};

export const addResourceHub = async (hub, imageFile) => {
  try {
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `hubs/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, "resourceHubs"), {
      ...hub,
      image: imageUrl,
      createdAt: new Date()
    });

    return { id: docRef.id, ...hub, image: imageUrl };
  } catch (error) {
    console.error("Failed to add resource hub:", error);
    throw error;
  }
};

export const updateResourceHub = async (id, hub, imageFile) => {
  try {
    let imageUrl = hub.image;
    if (imageFile) {
      const storageRef = ref(storage, `hubs/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "resourceHubs", id), {
      ...hub,
      image: imageUrl,
      updatedAt: new Date()
    });

    return { id, ...hub, image: imageUrl };
  } catch (error) {
    console.error("Failed to update resource hub:", error);
    throw error;
  }
};

export const deleteResourceHub = async (id) => {
  try {
    await deleteDoc(doc(db, "resourceHubs", id));
    return id;
  } catch (error) {
    console.error("Failed to delete resource hub:", error);
    throw error;
  }
};

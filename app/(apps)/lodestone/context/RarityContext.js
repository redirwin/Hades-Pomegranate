"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const RarityContext = createContext();

export function RarityProvider({ children }) {
  const [rarityOptions, setRarityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "settings", "rarity");

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setRarityOptions(doc.data().options);
        } else {
          const defaultOptions = [
            { value: "Junk", weight: 100 },
            { value: "Common", weight: 75 },
            { value: "Uncommon", weight: 45 },
            { value: "Rare", weight: 25 },
            { value: "Very Rare", weight: 15 },
            { value: "Legendary", weight: 3 },
            { value: "Artifact", weight: 2 },
            { value: "Wondrous", weight: 1 },
            { value: "Varies", weight: "random" }
          ];
          setDoc(docRef, { options: defaultOptions });
          setRarityOptions(defaultOptions);
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateRarityOptions = async (newOptions) => {
    try {
      const docRef = doc(db, "settings", "rarity");
      await setDoc(docRef, { options: newOptions });
    } catch (error) {
      throw error;
    }
  };

  return (
    <RarityContext.Provider
      value={{
        rarityOptions,
        updateRarityOptions,
        loading,
        error
      }}
    >
      {children}
    </RarityContext.Provider>
  );
}

export function useRarity() {
  const context = useContext(RarityContext);
  if (!context) {
    throw new Error("useRarity must be used within a RarityProvider");
  }
  return context;
}

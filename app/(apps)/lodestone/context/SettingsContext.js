"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    showDeletionConfirmation: true // default to true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "settings", "general");

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data());
        } else {
          // Set default settings if none exist
          const defaultSettings = {
            showDeletionConfirmation: true
          };
          setDoc(docRef, defaultSettings);
          setSettings(defaultSettings);
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

  const updateSettings = async (newSettings) => {
    try {
      const docRef = doc(db, "settings", "general");
      await setDoc(docRef, newSettings);
    } catch (error) {
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        loading,
        error
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

const ProvisionContext = createContext();

export function ProvisionProvider({ children }) {
  const [provisions, setProvisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const provisionsCollection = collection(db, "provisions");

    const unsubscribe = onSnapshot(
      provisionsCollection,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProvisions(items);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProvision = async (provisionData) => {
    try {
      const newDocRef = doc(collection(db, "provisions"));
      await setDoc(newDocRef, {
        ...provisionData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  };

  const updateProvision = async (id, provisionData) => {
    try {
      const docRef = doc(db, "provisions", id);
      await setDoc(
        docRef,
        {
          ...provisionData,
          updatedAt: new Date()
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  };

  const deleteProvision = async (id) => {
    try {
      await deleteDoc(doc(db, "provisions", id));
    } catch (error) {
      throw error;
    }
  };

  return (
    <ProvisionContext.Provider
      value={{
        provisions,
        addProvision,
        updateProvision,
        deleteProvision,
        loading,
        error
      }}
    >
      {children}
    </ProvisionContext.Provider>
  );
}

export function useProvisions() {
  const context = useContext(ProvisionContext);
  if (!context) {
    throw new Error("useProvisions must be used within a ProvisionProvider");
  }
  return context;
}

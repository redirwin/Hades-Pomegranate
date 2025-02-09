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

const ResourceHubContext = createContext();

export function ResourceHubProvider({ children }) {
  const [resourceHubs, setResourceHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hubsCollection = collection(db, "resourceHubs");

    const unsubscribe = onSnapshot(
      hubsCollection,
      (snapshot) => {
        const hubs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setResourceHubs(hubs);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addResourceHub = async (hubData) => {
    try {
      const newDocRef = doc(collection(db, "resourceHubs"));
      await setDoc(newDocRef, {
        ...hubData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: newDocRef.id, ...hubData };
    } catch (error) {
      throw error;
    }
  };

  const updateResourceHub = async (id, hubData) => {
    try {
      const docRef = doc(db, "resourceHubs", id);
      await setDoc(
        docRef,
        {
          ...hubData,
          updatedAt: new Date()
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  };

  const deleteResourceHub = async (id) => {
    try {
      await deleteDoc(doc(db, "resourceHubs", id));
    } catch (error) {
      throw error;
    }
  };

  return (
    <ResourceHubContext.Provider
      value={{
        resourceHubs,
        addResourceHub,
        updateResourceHub,
        deleteResourceHub,
        loading,
        error
      }}
    >
      {children}
    </ResourceHubContext.Provider>
  );
}

export function useResourceHubs() {
  const context = useContext(ResourceHubContext);
  if (!context) {
    throw new Error(
      "useResourceHubs must be used within a ResourceHubProvider"
    );
  }
  return context;
}

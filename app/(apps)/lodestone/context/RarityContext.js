"use client";

import { createContext, useContext, useState } from "react";

const RarityContext = createContext();

export function RarityProvider({ children }) {
  const [rarityOptions, setRarityOptions] = useState([
    { value: "Junk", weight: 100 },
    { value: "Common", weight: 75 },
    { value: "Uncommon", weight: 45 },
    { value: "Rare", weight: 25 },
    { value: "Very Rare", weight: 15 },
    { value: "Legendary", weight: 3 },
    { value: "Artifact", weight: 2 },
    { value: "Wondrous", weight: 1 },
    { value: "Varies", weight: "random" }
  ]);

  return (
    <RarityContext.Provider value={{ rarityOptions, setRarityOptions }}>
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

"use client";

import { useState, useEffect } from "react";

const MAX_HISTORY = 10;
const STORAGE_KEY = "lodestone-list-history";

export function useListHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (list) => {
    const timestamp = new Date().toISOString();
    const newList = { ...list, timestamp };

    setHistory((currentHistory) => {
      const newHistory = [newList, ...currentHistory].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
}

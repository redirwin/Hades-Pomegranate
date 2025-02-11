"use client";

import { useState, useEffect } from "react";

export function usePublicResourceHubs() {
  const [resourceHubs, setResourceHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHubs() {
      try {
        const response = await fetch("/api/lodestone/hubs");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to fetch resource hubs");
        }
        const data = await response.json();
        setResourceHubs(data);
      } catch (err) {
        console.error("Failed to fetch resource hubs:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHubs();
  }, []);

  return { resourceHubs, loading, error };
}

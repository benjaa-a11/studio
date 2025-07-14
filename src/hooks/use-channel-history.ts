"use client";

import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'plan-b-channel-history';

type ViewCounts = {
  [channelId: string]: number;
};

export function useChannelHistory() {
  const [viewCounts, setViewCounts] = useState<ViewCounts>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      // Professional check: Ensure data is a valid JSON string before parsing
      if (storedHistory && storedHistory !== 'undefined' && storedHistory !== 'null') {
        setViewCounts(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Error loading channel history from localStorage", error);
      setViewCounts({}); // Reset on error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateLocalStorage = (newHistory: ViewCounts) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving channel history to localStorage", error);
    }
  };

  const recordView = useCallback((channelId: string) => {
    setViewCounts(prev => {
      const newCount = (prev[channelId] || 0) + 1;
      const newHistory = { ...prev, [channelId]: newCount };
      updateLocalStorage(newHistory);
      return newHistory;
    });
  }, []);

  return { viewCounts, recordView, isLoaded };
}

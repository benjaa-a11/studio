"use client";

import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'plan-b-movie-history';
const MAX_HISTORY_ITEMS = 50; // To prevent localStorage from getting too large

export type MovieProgress = {
    progress: number;
    duration: number;
    lastWatched: string;
};

type MovieHistory = {
  [movieId: string]: MovieProgress;
};

const getInitialHistory = (): MovieHistory => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory && storedHistory !== 'undefined' && storedHistory !== 'null') {
      const parsed = JSON.parse(storedHistory);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error parsing movie history from localStorage on init", error);
  }
  return {};
};

export function useMovieHistory() {
  const [history, setHistory] = useState<MovieHistory>(getInitialHistory);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = useCallback((newHistory: MovieHistory) => {
    try {
      // Trim history if it gets too long
      const entries = Object.entries(newHistory);
      if (entries.length > MAX_HISTORY_ITEMS) {
        entries.sort(([, a], [, b]) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime());
        newHistory = Object.fromEntries(entries.slice(0, MAX_HISTORY_ITEMS));
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving movie history to localStorage", error);
    }
  }, []);

  const recordProgress = useCallback((movieId: string, progress: number, duration: number) => {
    if (!movieId || !isFinite(progress) || !isFinite(duration) || duration === 0) {
      return;
    }

    setHistory(prev => {
      const newHistory = {
        ...prev,
        [movieId]: {
          progress,
          duration,
          lastWatched: new Date().toISOString(),
        },
      };
      updateLocalStorage(newHistory);
      return newHistory;
    });
  }, [updateLocalStorage]);

  const getProgress = useCallback((movieId: string): MovieProgress | undefined => {
    return history[movieId];
  }, [history]);

  return { history, recordProgress, getProgress, isLoaded };
}


"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Radio } from '@/types';

type RadioPlayerState = {
  currentRadio: Radio | null;
  playlist: Radio[];
  isPlaying: boolean;
  isLoading: boolean;
  streamUrl: string;
  isFirst: boolean;
  isLast: boolean;
  play: (radio: Radio, playlist?: Radio[]) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  closePlayer: () => void;
  setStreamUrl: (url: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
};

const RadioPlayerContext = createContext<RadioPlayerState | undefined>(undefined);

export const RadioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [playlist, setPlaylist] = useState<Radio[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');

  const play = useCallback((radio: Radio, newPlaylist: Radio[] = []) => {
    setCurrentRadio(radio);
    setStreamUrl(radio.streamUrl?.[0] || '');
    setIsPlaying(true);
    setIsLoading(true);
    if (newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    } else {
      setPlaylist([radio]);
    }
  }, []);

  const closePlayer = useCallback(() => {
    setCurrentRadio(null);
    setIsPlaying(false);
    setIsLoading(false);
    setStreamUrl('');
    setPlaylist([]);
  }, []);

  const togglePlayPause = useCallback(() => {
    if(currentRadio) {
        setIsPlaying(prev => !prev);
    }
  }, [currentRadio]);

  const currentIndex = playlist.findIndex(r => r.id === currentRadio?.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === playlist.length - 1;

  const next = useCallback(() => {
    if (!isLast) {
      const nextRadio = playlist[currentIndex + 1];
      if (nextRadio) {
        play(nextRadio, playlist);
      }
    }
  }, [isLast, currentIndex, playlist, play]);

  const previous = useCallback(() => {
    if (!isFirst) {
      const prevRadio = playlist[currentIndex - 1];
      if (prevRadio) {
        play(prevRadio, playlist);
      }
    }
  }, [isFirst, currentIndex, playlist, play]);


  const value: RadioPlayerState = {
    currentRadio,
    playlist,
    isPlaying,
    isLoading,
    streamUrl,
    isFirst,
    isLast,
    play,
    togglePlayPause,
    next,
    previous,
    closePlayer,
    setStreamUrl,
    setIsPlaying,
    setIsLoading,
  };

  return React.createElement(RadioPlayerContext.Provider, { value }, children);
};

export const useRadioPlayer = () => {
  const context = useContext(RadioPlayerContext);
  if (!context) {
    throw new Error('useRadioPlayer must be used within a RadioPlayerProvider');
  }
  return context;
};


"use client";

import React, { createContext, useContext } from 'react';
import type { Radio } from '@/types';

type RadiosContextType = {
  radios: Radio[];
};

const RadiosContext = createContext<RadiosContextType | undefined>(undefined);

export const RadiosProvider = ({ children, radios }: { children: React.ReactNode; radios: Radio[] }) => {
  return React.createElement(RadiosContext.Provider, { value: { radios } }, children);
};

export const useRadios = () => {
  const context = useContext(RadiosContext);
  if (!context) {
    throw new Error('useRadios must be used within a RadiosProvider');
  }
  return context;
};

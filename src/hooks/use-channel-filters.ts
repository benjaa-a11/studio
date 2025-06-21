'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';

type FilterContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  allCategories: string[];
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({
  children,
  initialCategories = [],
}: {
  children: ReactNode;
  initialCategories: string[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const allCategories = useMemo(() => ['Todos', ...initialCategories], [initialCategories]);

  const value = {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allCategories,
  };

  return React.createElement(FilterContext.Provider, { value }, children);
}

export function useChannelFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useChannelFilters must be used within a FilterProvider');
  }
  return context;
}

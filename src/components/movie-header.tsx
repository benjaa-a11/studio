
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ListFilter, X } from 'lucide-react';
import { useMovieFilters } from '@/hooks/use-movie-filters';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from './ui/button';

export default function MovieHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allCategories,
  } = useMovieFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    setIsSearchOpen(prev => {
        if (prev) setSearchTerm(''); // Clear search on close
        return !prev;
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 h-24 pt-safe-top flex items-start justify-end p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">

        {/* Search Input and Button */}
        <div className={cn(
            "flex items-center gap-2 transition-all duration-300 ease-in-out",
            isSearchOpen ? 'w-48 sm:w-56' : 'w-10'
        )}>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              onClick={handleSearchToggle}
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </Button>
            <div className={cn("relative transition-all duration-300 ease-in-out overflow-hidden", isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0')}>
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full pl-4 pr-2 bg-black/40 text-white placeholder:text-white/70 border-white/30 backdrop-blur-sm focus:bg-black/50"
                aria-label="Buscar película"
              />
            </div>
        </div>

        {/* Filter Select */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger
            className="h-10 w-10 shrink-0 p-0 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-white/20 border-none focus:ring-0 focus:ring-offset-0"
            aria-label="Filtrar por categoría"
          >
            <ListFilter size={20} />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

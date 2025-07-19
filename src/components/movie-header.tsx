
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
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
import { usePathname } from 'next/navigation';

export default function MovieHeader() {
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, allCategories } = useMovieFilters();
  const pathname = usePathname();

  useEffect(() => {
    // Reset filters when navigating away from the main movies page
    if (pathname !== '/peliculas') {
      setSearchTerm('');
      setSelectedCategory('Todos');
    }
  }, [pathname, setSearchTerm, setSelectedCategory]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm pt-safe-top">
       <div className="container flex h-16 items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por título..."
            className="pl-10 h-10 w-full text-sm bg-muted border-transparent focus:bg-background focus:border-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar película"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger
            className="h-10 w-auto shrink-0 p-2 md:px-4 flex items-center justify-center bg-muted border-transparent focus:bg-background focus:border-input gap-2"
            aria-label="Filtrar por categoría"
          >
            <span className="hidden md:inline">{selectedCategory === 'Todos' ? 'Categorías' : selectedCategory}</span>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            {allCategories.filter(c => c !== 'Todos').map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

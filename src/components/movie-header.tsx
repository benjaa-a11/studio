
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMovieFilters } from '@/hooks/use-movie-filters';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import Image from 'next/image';

export default function MovieHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useMovieFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Effect to focus the input when it opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  // Effect to clear search term when the search bar is closed
  useEffect(() => {
    if (!isSearchOpen && searchTerm) {
      setSearchTerm('');
    }
  }, [isSearchOpen, searchTerm, setSearchTerm]);

  const handleSearchToggle = () => {
    setIsSearchOpen(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background pt-safe-top">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex items-center gap-4 transition-all duration-300",
          isSearchOpen ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
        )}>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <Image src="/icon.png" alt="Logo" width={32} height={32} />
                <span className="hidden sm:inline">Plan B</span>
            </Link>
             <div className="items-center gap-2 hidden md:flex">
                <Button variant="ghost" asChild>
                    <Link href="/peliculas">Películas</Link>
                </Button>
            </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
             <div className={cn(
                "relative flex w-full items-center transition-all duration-300 ease-in-out",
                isSearchOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
             )}>
                <Search size={18} className="absolute left-3 text-muted-foreground" />
                <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                        "h-9 w-full rounded-full pl-10 pr-4 bg-muted border-transparent focus:bg-background",
                        isSearchOpen ? "pointer-events-auto" : "pointer-events-none"
                    )}
                    aria-label="Buscar película"
                />
             </div>
             <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={handleSearchToggle}
            >
              <Search size={20} />
            </Button>
        </div>
      </div>
    </header>
  );
}

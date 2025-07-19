
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Radio, Heart, Settings } from 'lucide-react';
import { useMovieFilters } from '@/hooks/use-movie-filters';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MovieHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, allCategories } = useMovieFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
            </Link>
             <div className="items-center gap-1 hidden md:flex">
                <Button variant="ghost" asChild>
                    <Link href="/peliculas">Películas</Link>
                </Button>
                 <Button asChild variant="ghost">
                    <Link href="/radio">
                      <Radio className="h-5 w-5 mr-2" />
                      Radio
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/favoritos">
                      <Heart className="h-5 w-5 mr-2" />
                      Favoritos
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/ajustes">
                      <Settings className="h-5 w-5 mr-2" />
                      Ajustes
                    </Link>
                  </Button>
            </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:inline-flex">
                  {selectedCategory === 'Todos' ? 'Categorías' : selectedCategory}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                    <DropdownMenuRadioItem value="Todos">Todos</DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {allCategories.filter(c => c !== 'Todos').map(category => (
                        <DropdownMenuRadioItem key={category} value={category}>{category}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

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

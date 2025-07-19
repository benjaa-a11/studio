
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen(prev => {
        if (prev) setSearchTerm(''); // Clear search on close
        return !prev;
    });
  };

  return (
    <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 pt-safe-top",
        isScrolled ? "bg-black/80 backdrop-blur-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
                <Image src="/icon.png" alt="Logo" width={32} height={32} />
                <span className="hidden sm:inline">Plan B</span>
            </Link>
            <nav className="items-center gap-2 hidden md:flex">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full">Películas</Button>
            </nav>
        </div>

        <div className="flex items-center gap-2">
             <div className={cn(
                "flex items-center gap-2 transition-all duration-300 ease-in-out",
                isSearchOpen ? 'w-40 sm:w-56' : 'w-0'
             )}>
                 <div className={cn("relative transition-all duration-300 ease-in-out overflow-hidden", isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0')}>
                     <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full pl-4 pr-2 bg-white/10 text-white placeholder:text-white/70 border-white/30 backdrop-blur-sm focus:bg-black/50"
                        aria-label="Buscar película"
                    />
                 </div>
             </div>
             <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={handleSearchToggle}
            >
              <Search size={20} />
            </Button>
        </div>
      </div>
    </header>
  );
}

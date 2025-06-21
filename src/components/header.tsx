"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tv2, Search, ListFilter, Settings } from "lucide-react";
import { useChannelFilters } from "@/hooks/use-channel-filters";

const Logo = () => (
   <div className="flex h-10 items-center justify-center gap-2 font-sans">
      <Tv2 className="h-7 w-7 text-primary" />
    </div>
);

function Filters() {
  const { 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory, 
    allCategories 
  } = useChannelFilters();

  return (
    <div className="flex w-full max-w-lg items-center gap-2">
       <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar canales..."
            className="pl-10 h-10 w-full text-base bg-muted border-transparent focus:bg-background focus:border-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar canal"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              className="h-10 w-10 shrink-0 p-0 flex items-center justify-center bg-muted border-transparent focus:bg-background focus:border-input"
              aria-label="Filtrar por categoría"
            >
                <ListFilter className="h-5 w-5 text-muted-foreground" />
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
  );
}

export default function Header() {
  const pathname = usePathname();
  const showFilters = pathname === '/';

  return (
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center" aria-label="Volver a la página de inicio">
            <Logo/>
          </Link>
          
          <div className="hidden flex-1 items-center justify-center px-4 md:flex">
             {showFilters && <Filters />}
          </div>

          <div className="flex items-center">
            <nav className="hidden items-center space-x-1 md:flex">
              <Button asChild variant="ghost">
                <Link href="/ajustes">
                  <Settings className="h-5 w-5 mr-2" />
                  Ajustes
                </Link>
              </Button>
            </nav>
          </div>
        </div>
        {showFilters && (
          <div className="container pb-4 md:hidden">
            <Filters />
          </div>
        )}
      </header>
  );
}

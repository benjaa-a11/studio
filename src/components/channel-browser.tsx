"use client";

import { useState, useMemo } from "react";
import type { Channel } from "@/types";
import { Input } from "@/components/ui/input";
import ChannelCard from "./channel-card";
import { Search, Film, ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChannelBrowserProps = {
  channels: Channel[];
  categories: string[];
};

export default function ChannelBrowser({
  channels,
  categories,
}: ChannelBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const allCategories = ["Todos", ...categories];

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesCategory =
        selectedCategory === "Todos" || channel.category === selectedCategory;
      const matchesSearch =
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [channels, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <div id="search-section" className="flex scroll-mt-20 flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o descripción..."
            className="pl-10 h-11 text-base w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar canal"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 w-full md:w-[200px]" aria-label="Filtrar por categoría">
                    <div className="flex items-center gap-2">
                      <ListFilter className="h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Filtrar por categoría" />
                    </div>
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

      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Film className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            No se encontraron canales
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Prueba a cambiar la categoría o utiliza un término de búsqueda diferente.
          </p>
        </div>
      )}
    </div>
  );
}

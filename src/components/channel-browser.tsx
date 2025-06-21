"use client";

import { useState, useMemo } from "react";
import type { Channel } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChannelCard from "./channel-card";
import { Search, Clapperboard } from "lucide-react";

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar canales..."
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 flex justify-center flex-wrap gap-2">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              onClick={() => setSelectedCategory(category)}
              className="font-headline rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <Clapperboard className="w-16 h-16 text-muted-foreground/80 mb-4" />
          <h3 className="font-headline text-2xl font-semibold text-foreground">
            No se encontraron canales
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Prueba a cambiar la categoría, o utiliza un término de búsqueda diferente para encontrar lo que buscas.
          </p>
        </div>
      )}
    </div>
  );
}

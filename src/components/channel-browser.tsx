"use client";

import { useState, useMemo } from "react";
import type { Channel } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChannelCard from "./channel-card";
import { Search } from "lucide-react";

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
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="font-headline"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
          <h3 className="font-headline text-xl font-semibold text-muted-foreground">
            No se encontraron canales
          </h3>
          <p className="mt-2 text-muted-foreground">
            Intenta cambiar los filtros o el término de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}

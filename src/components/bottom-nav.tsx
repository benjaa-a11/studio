
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Settings, Popcorn, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRadioPlayer } from "@/hooks/use-radio-player";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/peliculas", label: "Películas", icon: Popcorn },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { currentRadio } = useRadioPlayer();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-sm md:hidden pb-safe-bottom transition-transform duration-300",
        currentRadio && "translate-y-[-64px]"
    )}>
      <nav className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = isClient && ((pathname === '/' && item.href === '/') || (item.href !== '/' && pathname.startsWith(item.href)));
          return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:text-primary",
              isActive ? "text-primary" : ""
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )})}
      </nav>
    </div>
  );
}

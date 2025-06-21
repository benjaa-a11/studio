"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { AboutDialog } from "./about-dialog";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isAboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-sm md:hidden">
        <nav className="flex h-16 items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:text-primary",
                (pathname === item.href || (item.href === "/favoritos" && pathname.startsWith("/favoritos"))) && "text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setAboutOpen(true)}
            className="flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:text-primary"
            aria-label="Acerca de la aplicación"
          >
            <Info className="h-6 w-6" />
            <span className="text-xs font-medium">Acerca de</span>
          </button>
        </nav>
      </div>
      <AboutDialog open={isAboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}

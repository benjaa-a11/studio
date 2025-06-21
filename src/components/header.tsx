"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Tv, Home, Star, Settings, Info } from "lucide-react";
import { PlanBLogo } from "@/components/icons";
import { AboutDialog } from "./about-dialog";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Inicio", icon: Home },
  // Placeholder for future categories page
  // { href: "/categorias", label: "Categorías", icon: Tv },
];

export default function Header() {
  const [isAboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PlanBLogo className="h-7 w-auto" />
          </Link>

          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="hidden items-center space-x-2 md:flex">
              <Button variant="ghost" size="sm" onClick={() => setAboutOpen(true)}>
                Acerca de
              </Button>
            </nav>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="p-4">
                  <div className="mb-6">
                    <PlanBLogo className="h-7 w-auto" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link href={link.href}>
                          <Button variant="ghost" className="w-full justify-start">
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.label}
                          </Button>
                        </Link>
                      </SheetClose>
                    ))}
                    <div className="pt-4 mt-4 border-t">
                       <p className="px-3 text-xs text-muted-foreground mb-2">Próximamente</p>
                       <Button variant="ghost" className="w-full justify-start" disabled>
                          <Star className="mr-2 h-4 w-4" />
                          Mis Favoritos
                       </Button>
                       <Button variant="ghost" className="w-full justify-start" disabled>
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración
                       </Button>
                    </div>
                     <div className="pt-4 mt-4 border-t">
                       <SheetClose asChild>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setAboutOpen(true)}>
                            <Info className="mr-2 h-4 w-4" />
                            Acerca de
                          </Button>
                        </SheetClose>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <AboutDialog open={isAboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Tv2, Home, Star, Settings, Info } from "lucide-react";
import { AboutDialog } from "./about-dialog";
import { useState } from "react";
import { Separator } from "./ui/separator";

const navLinks = [
  { href: "/", label: "Inicio", icon: Home },
];

const Logo = () => (
   <div className="flex items-center gap-2 font-sans">
      <Tv2 className="h-7 w-7 text-primary" />
      <span className="font-bold text-xl">Plan B</span>
    </div>
)

export default function Header() {
  const [isAboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="Volver a la página de inicio">
            <Logo/>
          </Link>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="hidden items-center space-x-2 md:flex">
              {navLinks.map((link) => (
                <Button key={link.href} variant="ghost" asChild>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </Button>
              ))}
              <Button variant="ghost" onClick={() => setAboutOpen(true)}>
                <Info className="mr-2 h-4 w-4" />
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
                 <div className="p-4 flex flex-col h-full">
                  <div className="mb-6">
                    <Logo />
                  </div>
                  <div className="flex flex-col space-y-1">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link href={link.href}>
                          <Button variant="ghost" className="w-full justify-start text-base py-6">
                            <link.icon className="mr-3 h-5 w-5" />
                            {link.label}
                          </Button>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div>
                     <p className="px-3 text-sm text-muted-foreground mb-2">Próximamente</p>
                     <Button variant="ghost" className="w-full justify-start text-base py-6" disabled>
                        <Star className="mr-3 h-5 w-5" />
                        Mis Favoritos
                     </Button>
                     <Button variant="ghost" className="w-full justify-start text-base py-6" disabled>
                        <Settings className="mr-3 h-5 w-5" />
                        Configuración
                     </Button>
                  </div>

                  <div className="mt-auto">
                     <Separator className="my-4" />
                     <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start text-base py-6" onClick={() => setAboutOpen(true)}>
                          <Info className="mr-3 h-5 w-5" />
                          Acerca de
                        </Button>
                      </SheetClose>
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

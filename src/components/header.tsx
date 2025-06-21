"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tv2 } from "lucide-react";
import { AboutDialog } from "./about-dialog";
import { useState } from "react";

const Logo = () => (
   <div className="flex items-center gap-2 font-sans">
      <Tv2 className="h-7 w-7 text-primary" />
      <span className="font-bold text-xl tracking-tight">Plan B</span>
    </div>
)

export default function Header() {
  const [isAboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="Volver a la página de inicio">
            <Logo/>
          </Link>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="hidden items-center space-x-1 md:flex">
              <Button variant="ghost" asChild>
                  <Link href="/">
                    Inicio
                  </Link>
                </Button>
              <Button variant="ghost" onClick={() => setAboutOpen(true)}>
                Acerca de
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <AboutDialog open={isAboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}

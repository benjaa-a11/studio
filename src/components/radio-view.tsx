
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import type { Radio } from "@/types";
import { Button } from "@/components/ui/button";
import { RadiosProvider } from "@/hooks/use-radios";
import RadioCard from "./radio-card";
import { Skeleton } from "./ui/skeleton";

const AudioPlayer = dynamic(() => import('@/components/audio-player'), {
  loading: () => <Skeleton className="w-full max-w-md mx-auto h-[450px] rounded-xl" />,
  ssr: false
});

type RadioViewProps = {
  radio: Radio;
  allRadios: Radio[];
};

export default function RadioView({ radio: initialRadio, allRadios }: RadioViewProps) {
  const router = useRouter();
  const [currentRadio, setCurrentRadio] = useState(initialRadio);
  
  const radioIndex = useMemo(() => {
      return allRadios.findIndex(r => r.id === currentRadio.id);
  }, [allRadios, currentRadio]);

  const isFirst = radioIndex === 0;
  const isLast = radioIndex === allRadios.length - 1;

  const navigateToRadio = (index: number) => {
    if (index >= 0 && index < allRadios.length) {
      const nextRadioId = allRadios[index].id;
      router.push(`/radio/${nextRadioId}`);
    }
  };

  const next = () => {
    if (!isLast) {
      navigateToRadio(radioIndex + 1);
    }
  };

  const previous = () => {
    if (!isFirst) {
      navigateToRadio(radioIndex - 1);
    }
  };

  useEffect(() => {
      setCurrentRadio(initialRadio);
  }, [initialRadio]);

  const otherRadios = allRadios.filter(r => r.id !== currentRadio.id).slice(0, 5);

  return (
    <RadiosProvider radios={allRadios}>
      <div className="flex h-dvh flex-col bg-muted/20">
          <header className="flex h-16 shrink-0 items-center border-b bg-background px-4 md:px-6 pt-safe-top">
              <Button variant="outline" size="icon" asChild>
                  <Link href="/radio" aria-label="Volver a radios">
                  <ArrowLeft className="h-5 w-5" />
                  </Link>
              </Button>
          </header>
          <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-4 md:p-8">
                  <AudioPlayer 
                    radio={currentRadio}
                    onNext={next}
                    onPrev={previous}
                    isFirst={isFirst}
                    isLast={isLast}
                  />

                  {otherRadios.length > 0 && (
                  <aside className="mt-12">
                      <h2 className="text-2xl font-bold tracking-tight">Otras Radios</h2>
                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {otherRadios.map((r, index) => <RadioCard key={r.id} radio={r} index={index} />)}
                      </div>
                  </aside>
                  )}
              </div>
          </main>
      </div>
    </RadiosProvider>
  );
}

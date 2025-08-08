
"use client";

import Link from "next/link";
import { ArrowLeft, SwitchCamera } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import dynamic from 'next/dynamic';

import type { Radio } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RadioCard from "./radio-card";
import { useRadioPlayer } from "@/hooks/use-radio-player";
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
  const { toast } = useToast();
  const { 
    currentRadio, 
    play, 
    streamUrl, 
    setStreamUrl, 
    next, 
    previous,
    isFirst,
    isLast 
  } = useRadioPlayer();
  
  const [radio, setRadio] = useState(initialRadio);

  useEffect(() => {
    // If the radio in the context is different from the one on the page,
    // play the one from the page URL.
    if (!currentRadio || currentRadio.id !== initialRadio.id) {
        play(initialRadio, allRadios);
    }
  }, [initialRadio, currentRadio, play, allRadios]);

  // Update local radio state when global context changes
  useEffect(() => {
    if (currentRadio) {
      setRadio(currentRadio);
    }
  }, [currentRadio]);

  const handleSwitchStream = () => {
    const streamLinks = radio.streamUrl || [];
    if (streamLinks.length <= 1) return;
    
    const currentIndex = streamLinks.indexOf(streamUrl);
    const nextIndex = (currentIndex + 1) % streamLinks.length;
    setStreamUrl(streamLinks[nextIndex]);
    
    toast({
      title: (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <SwitchCamera className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-foreground">Cambiando de señal</p>
            <p className="text-sm text-muted-foreground">
              Usando Opción <span className="font-bold text-foreground">{nextIndex + 1}</span> de <span className="font-bold text-foreground">{streamLinks.length}</span>
            </p>
          </div>
        </div>
      ),
      duration: 3000,
    });
  };

  const otherRadios = allRadios.filter(r => r.id !== radio.id).slice(0, 4);

  return (
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
                  radio={radio} 
                  currentStreamUrl={streamUrl}
                  onNext={next}
                  onPrev={previous}
                  isFirst={isFirst}
                  isLast={isLast}
                />

                {radio.streamUrl && radio.streamUrl.length > 1 && (
                    <div className="mt-6 flex justify-center">
                        <Button
                        variant="secondary"
                        onClick={handleSwitchStream}
                        >
                        <SwitchCamera className="h-4 w-4 sm:mr-2" />
                        <span>Cambiar Fuente ({radio.streamUrl.indexOf(streamUrl) + 1}/{radio.streamUrl.length})</span>
                        </Button>
                    </div>
                )}

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
  );
}

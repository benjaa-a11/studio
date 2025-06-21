"use client";
import type { Match } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Clock, Tv, VideoOff } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MdcHeroProps = {
    matches: Match[];
};

export default function MdcHero({ matches }: MdcHeroProps) {
    if (matches.length === 0) {
        return null;
    }

    return (
        <div className="mb-12">
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Mundial de Clubes 2025</h1>
                <p className="text-muted-foreground">Partidos de Hoy</p>
            </div>
            <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <div className="flex w-max space-x-4 pb-4">
                    {matches.map((match) => (
                        <Card key={match.id} className="w-[340px] sm:w-[380px] overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300">
                            <CardContent className="p-6 flex flex-col items-center justify-center">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                                        <Image src={match.team1Logo} alt={match.team1} width={64} height={64} className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                                        <h3 className="font-semibold truncate w-full">{match.team1}</h3>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Image
                                            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgncCRI6MuG41vT_fctpMHh4__yYc2efUPB7jpjV9Ro8unR17c9EMBQcaIYmjPShAnnLG1Q1m-9KbNmZoK2SJnWV9bwJ1FN4OMzgcBcy7inf6c9JCSKFz1uV31aC6B1u4EeGxDwQE4z24d7sVZOJzpFjBAG0KECpsJltnqNyH9_iaTnGukhT4gWGeGj_FQ/s16000/Copa%20Mundial%20de%20Clubes.png"
                                            alt="Mundial de Clubes 2025 Logo"
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                            data-ai-hint="fifa logo"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                                        <Image src={match.team2Logo} alt={match.team2} width={64} height={64} className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                                        <h3 className="font-semibold truncate w-full">{match.team2}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-primary mt-4 text-lg font-bold">
                                    <Clock className="h-5 w-5" />
                                    <span>{match.time} hs</span>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/40 px-6 py-4">
                                {match.channels && match.channels.length > 0 ? (
                                    match.channels.length === 1 ? (
                                        <Button asChild className="w-full">
                                            <Link href={`/canal/${match.channels[0].id}`}>
                                                <Tv className="mr-2 h-4 w-4" />
                                                Ver en {match.channels[0].name}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="w-full">
                                                    <Tv className="mr-2 h-4 w-4" />
                                                    Ver Partido
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuLabel>Opciones de transmisión</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {match.channels.map((channel) => (
                                                    <DropdownMenuItem key={channel.id} asChild>
                                                        <Link href={`/canal/${channel.id}`}>{channel.name}</Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                ) : (
                                    <Button className="w-full" disabled>
                                        <VideoOff className="mr-2 h-4 w-4" />
                                        No disponible
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}

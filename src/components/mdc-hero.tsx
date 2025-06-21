"use client";
import type { Match } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Clock, Tv } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
                                <div className="flex items-center justify-around w-full">
                                    <div className="flex flex-col items-center gap-2 text-center w-[120px]">
                                        <Image src={match.team1Logo} alt={match.team1} width={72} height={72} className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                                        <h3 className="font-semibold truncate w-full">{match.team1}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-muted-foreground mx-4">VS</span>
                                    <div className="flex flex-col items-center gap-2 text-center w-[120px]">
                                        <Image src={match.team2Logo} alt={match.team2} width={72} height={72} className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                                        <h3 className="font-semibold truncate w-full">{match.team2}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-primary mt-4 text-lg font-bold">
                                    <Clock className="h-5 w-5" />
                                    <span>{match.time} hs</span>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/40 px-6 py-4">
                                 <Button asChild className="w-full">
                                    <Link href={`/canal/${match.channelId}`}>
                                        <Tv className="mr-2 h-4 w-4" />
                                        Ver en {match.channelName}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}


"use client";
import type { Match } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Clock, Tv, VideoOff, Clapperboard, Radio, ChevronDown, Table as TableIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import React, { memo, useState, useEffect } from "react";
import { useTheme } from "next-themes";


type MatchesHeroProps = {
    matches: Match[];
};

const MatchCard = memo(function MatchCard({ match }: { match: Match }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const renderWatchButton = () => {
        if (!match.isWatchable) {
            return (
                <Button className="w-full" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Próximamente
                </Button>
            );
        }

        if (match.channels && match.channels.length > 0) {
             if (match.channels.length === 1) {
                return (
                    <Button asChild className={cn("w-full", match.isLive && "animate-pulse")} variant={match.isLive ? "destructive" : "default"}>
                        <Link href={`/canal/${match.channels[0].id}`}>
                            {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                            {match.isLive ? "Ver EN VIVO" : `Ver en ${match.channels[0].name}`}
                        </Link>
                    </Button>
                );
            }

            const commonButtonProps = {
                className: cn("w-full", match.isLive && "animate-pulse"),
                variant: (match.isLive ? "destructive" : "default") as "destructive" | "default",
            };
            const commonButtonContent = (
                <>
                    {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                    {match.isLive ? "Ver EN VIVO" : "Elegir Canal"}
                </>
            );

            const mobileChannelLinks = match.channels.map((channel) => (
                 <Link key={channel.id} href={`/canal/${channel.id}`} className="flex items-center gap-4 w-full text-left px-6 py-4 transition-colors hover:bg-muted">
                    <div className="relative h-8 w-14 flex-shrink-0">
                        {channel.logoUrl ? (
                            <Image unoptimized src={channel.logoUrl[0]} alt={`Logo de ${channel.name}`} fill sizes="56px" className="object-contain" data-ai-hint="channel logo" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
                                <Clapperboard className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <span className="flex-grow font-medium">{channel.name}</span>
                </Link>
            ));
            
            const desktopChannelLinks = match.channels.flatMap((channel, index) => {
                const item = (
                    <DropdownMenuItem key={channel.id} asChild className="p-0">
                        <Link href={`/canal/${channel.id}`} className="flex items-center gap-3 w-full px-2 py-1.5">
                            <div className="relative h-6 w-10 flex-shrink-0">
                                {channel.logoUrl ? (
                                    <Image unoptimized src={channel.logoUrl[0]} alt={`Logo de ${channel.name}`} fill sizes="40px" className="object-contain" data-ai-hint="channel logo" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted"><Clapperboard className="h-4 w-4 text-muted-foreground" /></div>
                                )}
                            </div>
                            <span className="flex-grow">{channel.name}</span>
                        </Link>
                    </DropdownMenuItem>
                );

                if (index < match.channels.length - 1) {
                    return [item, <DropdownMenuSeparator key={`sep-${channel.id}`} />];
                }
                return [item];
            });

            return (
                <>
                    {/* Desktop Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button {...commonButtonProps} className={cn(commonButtonProps.className, "hidden md:inline-flex")}>
                                {commonButtonContent}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                             <DropdownMenuLabel>Opciones de transmisión</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                            <div className="flex flex-col divide-y divide-border/50">
                                {desktopChannelLinks}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button {...commonButtonProps} className={cn(commonButtonProps.className, "md:hidden")}>
                                {commonButtonContent}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80dvh] flex flex-col p-0">
                            <SheetHeader className="text-left flex-shrink-0 border-b px-6 pt-6 pb-4">
                                <SheetTitle>Opciones para ver</SheetTitle>
                                <SheetDescription className="!mt-1">
                                    {match.team1} vs {match.team2}
                                </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="flex-grow">
                                <div className="flex flex-col divide-y divide-border/50">
                                    {mobileChannelLinks}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </>
            );
        }

        return (
            <Button className="w-full" disabled>
                <VideoOff className="mr-2 h-4 w-4" />
                No disponible
            </Button>
        );
    }
    
    const renderImageButton = () => {
        if (!match.imageUrl) return null;

        const content = (
            <div className="p-2">
                <Image src={match.imageUrl} alt={`Imagen para ${match.tournamentName}`} width={600} height={800} className="rounded-lg object-contain" unoptimized />
            </div>
        );

        return (
            <>
                {/* Desktop Dialog */}
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline" size="icon" className="hidden md:inline-flex">
                            <TableIcon className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl p-2">
                         {content}
                    </DialogContent>
                </Dialog>
                
                {/* Mobile Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" size="icon" className="md:hidden">
                            <TableIcon className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl max-h-[80dvh] p-2">
                         <ScrollArea className="h-full w-full">
                           {content}
                         </ScrollArea>
                    </SheetContent>
                </Sheet>
            </>
        )
    }

    const getTournamentLogo = () => {
        if (!match.tournamentLogo) return null;
        if (typeof match.tournamentLogo === 'string') {
            return match.tournamentLogo;
        }
        if (!mounted) {
            return match.tournamentLogo.light;
        }
        return resolvedTheme === 'dark' ? match.tournamentLogo.dark : match.tournamentLogo.light;
    };
    
    const tournamentLogoUrl = getTournamentLogo();

    function splitTeamName(name: string): [string, string?] {
        if (!name) return [""];
        if (name.length <= 14) return [name];

        const middle = Math.floor(name.length / 2);
        let splitIndex = name.lastIndexOf(" ", middle);

        if (splitIndex === -1 || splitIndex < 4) splitIndex = name.indexOf(" ", middle);
        if (splitIndex === -1 || splitIndex > name.length - 4) return [name];

        return [name.slice(0, splitIndex), name.slice(splitIndex + 1)];
    }

    return (
        <Card className="w-[340px] sm:w-[380px] h-auto overflow-hidden shadow-lg flex-shrink-0 opacity-0 animate-fade-in-up flex flex-col">
            <div className="p-3 bg-muted/40 border-b flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {tournamentLogoUrl && (
                        <Image unoptimized src={tournamentLogoUrl} alt={match.tournamentName || 'Tournament'} width={24} height={24} sizes="24px" className="h-6 w-6 object-contain flex-shrink-0" data-ai-hint="tournament logo" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs truncate">{match.tournamentName}</p>
                        {match.dates && (
                            <p className="text-xs text-muted-foreground truncate">{match.dates}</p>
                        )}
                    </div>
                </div>
                 {match.statusText ? (
                    <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">{match.statusText}</Badge>
                ) : match.isLive ? (
                    <Badge variant="destructive" className="animate-pulse text-xs font-bold px-2 py-0.5">EN VIVO</Badge>
                ) : (
                    <div className="flex items-center gap-1.5 text-primary text-sm font-bold flex-shrink-0">
                        <Clock className="h-4 w-4" />
                        <span>{match.time} hs</span>
                    </div>
                )}
            </div>
            
            <CardContent className="p-6 flex-grow flex flex-col items-center justify-center">
                <div className="flex items-center justify-around w-full gap-4">
                    <div className="flex flex-col items-center gap-2 text-center flex-1 min-w-0">
                        <Image
                            unoptimized
                            src={match.team1Logo || 'https://placehold.co/128x128.png'}
                            alt={match.team1}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="h-16 w-16 object-contain drop-shadow-sm"
                            data-ai-hint="team logo"
                        />
                        <div className="h-[40px] flex flex-col justify-center items-center w-full overflow-hidden">
                            <h3 className="font-semibold text-base text-center w-full leading-tight break-words">
                                {splitTeamName(match.team1).map((line, idx) => (
                                    <span
                                        key={idx}
                                        className="block max-w-full break-words truncate"
                                        style={{ lineHeight: "1.1" }}
                                    >
                                        {line}
                                    </span>
                                ))}
                            </h3>
                        </div>
                    </div>
                    
                    <div className="text-muted-foreground font-bold text-lg">VS</div>
                    
                    <div className="flex flex-col items-center gap-2 text-center flex-1 min-w-0">
                        <Image
                            unoptimized
                            src={match.team2Logo || 'https://placehold.co/128x128.png'}
                            alt={match.team2}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="h-16 w-16 object-contain drop-shadow-sm"
                            data-ai-hint="team logo"
                        />
                        <div className="h-[40px] flex flex-col justify-center items-center w-full overflow-hidden">
                            <h3 className="font-semibold text-base text-center w-full leading-tight break-words">
                                {splitTeamName(match.team2).map((line, idx) => (
                                    <span
                                        key={idx}
                                        className="block max-w-full break-words truncate"
                                        style={{ lineHeight: "1.1" }}
                                    >
                                        {line}
                                    </span>
                                ))}
                            </h3>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/40 p-2 flex items-center justify-between gap-2">
                <div className="flex-1">
                    {renderWatchButton()}
                </div>
                {renderImageButton()}
            </CardFooter>
        </Card>
    );
});
MatchCard.displayName = 'MatchCard';

export default function MatchesHero({ matches }: MatchesHeroProps) {
    if (matches.length === 0) {
        return null;
    }

    // For larger screens, we might show multiple cards. For smaller, a scroll area.
    return (
        <div className="relative">
            <div className="block xl:hidden">
                 <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                    <div className="flex w-max space-x-4 pb-4">
                        {matches.map((match, index) => (
                            <div key={match.id} style={{ animationDelay: `${index * 80}ms` }}>
                                <MatchCard match={match} />
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
             <div className="hidden xl:flex justify-center items-start gap-4">
                {matches.slice(0, 3).map((match, index) => (
                     <div key={match.id} style={{ animationDelay: `${index * 80}ms` }}>
                        <MatchCard match={match} />
                    </div>
                ))}
            </div>
        </div>
    );
}

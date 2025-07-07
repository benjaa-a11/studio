"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tv, Film, Radio, CalendarDays, Shield, Users, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin/channels", icon: Tv, label: "Canales" },
    { href: "/admin/movies", icon: Film, label: "Películas" },
    { href: "/admin/radios", icon: Radio, label: "Radios" },
    { href: "/admin/agenda", icon: CalendarDays, label: "Agenda" },
    { href: "/admin/tournaments", icon: Shield, label: "Torneos" },
    { href: "/admin/teams", icon: Users, label: "Equipos" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                    href="/admin"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Home className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Plan B Admin</span>
                </Link>
                <TooltipProvider>
                    {navItems.map((item) => (
                         <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                        pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="sr-only">{item.label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/ajustes"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Ajustes</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">Ajustes</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    );
}

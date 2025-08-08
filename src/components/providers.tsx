

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/theme-provider";
import { ChannelFilterProvider } from '@/hooks/use-channel-filters';
import { MovieFilterProvider } from '@/hooks/use-movie-filters';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import MovieHeader from './movie-header';
import DataRefresher from './data-refresher';
import { RadioPlayerProvider } from '@/hooks/use-radio-player';
import RadioMiniPlayer from './radio-mini-player';

type ProvidersProps = {
    children: React.ReactNode;
    channelCategories: string[];
    movieCategories: string[];
};

export function Providers({ children, channelCategories, movieCategories }: ProvidersProps) {
    const pathname = usePathname();
    
    const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/');
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';
    const isRadioPlayerPage = pathname.startsWith('/radio/');

    const showMainLayout = !isPlayerPage && !isAdminPage && !isLoginPage && !isRadioPlayerPage;
    const isMovieSection = pathname.startsWith('/peliculas');
    
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="plan-b-theme"
            enableSystem
        >
          <RadioPlayerProvider>
            <ChannelFilterProvider initialCategories={channelCategories}>
                <MovieFilterProvider initialCategories={movieCategories}>
                    {showMainLayout && !isMovieSection && <DataRefresher />}
                    
                    {showMainLayout && !isMovieSection && <Header />}
                    
                    {isMovieSection && <MovieHeader />}

                    <main className={`flex-1 ${showMainLayout || isMovieSection ? 'pb-24 md:pb-4' : ''}`}>
                        {children}
                    </main>

                    {showMainLayout && <BottomNav />}
                    <RadioMiniPlayer />
                    <Toaster />
                </MovieFilterProvider>
            </ChannelFilterProvider>
          </RadioPlayerProvider>
        </ThemeProvider>
    );
}

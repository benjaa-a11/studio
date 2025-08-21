
'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/theme-provider";
import { ChannelFilterProvider } from '@/hooks/use-channel-filters';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import DataRefresher from './data-refresher';

type ProvidersProps = {
    children: React.ReactNode;
    channelCategories: string[];
};

export function Providers({ children, channelCategories }: ProvidersProps) {
    const pathname = usePathname();
    
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/');
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';
    const isRadioPlayerPage = pathname.startsWith('/radio/');
    const isNewsArticlePage = /^\/noticias\/[^/]+$/.test(pathname);
    const isImageViewerPage = pathname.startsWith('/imagen/');

    const showMainLayout = !isPlayerPage && !isAdminPage && !isLoginPage && !isRadioPlayerPage && !isNewsArticlePage && !isImageViewerPage;
    
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="plan-b-theme"
            enableSystem
        >
            <ChannelFilterProvider initialCategories={channelCategories}>
                    {showMainLayout && <DataRefresher />}
                    
                    {showMainLayout && <Header />}

                    <main className={`flex-1 ${showMainLayout ? 'pb-24 md:pb-4' : ''}`}>
                        {children}
                    </main>

                    {showMainLayout && <BottomNav />}
                    <Toaster />
            </ChannelFilterProvider>
        </ThemeProvider>
    );
}

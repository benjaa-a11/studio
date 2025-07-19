
"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { ReactNode } from 'react';
import DataRefresher from '@/components/data-refresher';
import MovieHeader from './movie-header';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/') || pathname.startsWith('/radio/');
  const isAdminPage = pathname.startsWith('/admin');
  const isMoviePage = pathname.startsWith('/peliculas');
  const isLoginPage = pathname === '/login';
  const isMaintenancePage = pathname.startsWith('/mantenimiento');

  const showMainLayout = !isPlayerPage && !isAdminPage && !isMoviePage && !isMaintenancePage && !isLoginPage;

  return (
    <>
      {showMainLayout && <DataRefresher />}
      {showMainLayout && <Header />}
      
      {isMoviePage && <MovieHeader />}

      <main className={`flex-1 ${showMainLayout ? 'pb-20 md:pb-0' : ''} ${isMoviePage ? 'bg-black' : ''}`}>
        {children}
      </main>

      {showMainLayout && <BottomNav />}
    </>
  );
}

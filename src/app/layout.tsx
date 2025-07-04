import type { Metadata, Viewport } from "next";
import { Poppins, PT_Sans } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import LayoutWrapper from "@/components/layout-wrapper";
import { getCategories, getMovieCategories } from "@/lib/actions";
import { ChannelFilterProvider } from "@/hooks/use-channel-filters";
import { MovieFilterProvider } from "@/hooks/use-movie-filters";
import { ThemeProvider } from "@/components/theme-provider";

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const fontPtSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: "Plan B Streaming",
  description: "Tu alternativa para ver televisión en vivo.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Plan B Streaming",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F8F9' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const channelCategories = await getCategories();
  const movieCategories = await getMovieCategories();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontPoppins.variable,
          fontPtSans.variable
        )}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  try {
                    const storedTheme = localStorage.getItem('plan-b-theme');
                    if (storedTheme) return storedTheme;
                  } catch (e) { /* ignore */ }
                  return 'dark'; // Default theme
                }
                let theme = getInitialTheme();
                if (theme === 'system') {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <ThemeProvider defaultTheme="dark" storageKey="plan-b-theme">
          <ChannelFilterProvider initialCategories={channelCategories}>
            <MovieFilterProvider initialCategories={movieCategories}>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster />
            </MovieFilterProvider>
          </ChannelFilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

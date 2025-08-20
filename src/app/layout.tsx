import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCategories } from "@/lib/actions";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Plan B Streaming",
  description: "Tu alternativa para ver televisión en vivo.",
  manifest: "/manifest.webmanifest",
  icons: {
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
    { media: '(prefers-color-scheme: light)', color: '#F1F5F8' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const channelCategories = await getCategories();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontInter.variable,
          fontPoppins.variable
        )}
      >
        <Providers 
          channelCategories={channelCategories} 
        >
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import LayoutWrapper from "@/components/layout-wrapper";
import { getCategories } from "@/lib/actions";
import { FilterProvider } from "@/hooks/use-channel-filters";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Plan B Streaming",
  description: "Tu alternativa para ver televisión en vivo.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable
        )}
      >
        <ThemeProvider defaultTheme="dark" storageKey="plan-b-theme">
          <FilterProvider initialCategories={categories}>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster />
          </FilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import AdminSidebar from "@/components/admin/admin-sidebar";
import { ReactNode } from "react";
import Link from "next/link";
import { Tv } from "lucide-react";
import { Providers } from "@/components/providers";

// This layout is separate from the main app layout
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
     <html lang="es" suppressHydrationWarning>
      <body>
        <Providers channelCategories={[]} movieCategories={[]}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <AdminSidebar />
              <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                   <Link
                      href="/"
                      className="flex items-center gap-2 font-semibold"
                    >
                      <Tv className="h-6 w-6" />
                      <span>Plan B Streaming</span>
                    </Link>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                  {children}
                </main>
              </div>
            </div>
        </Providers>
      </body>
    </html>
  );
}

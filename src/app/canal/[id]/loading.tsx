import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChannelLoading() {
  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="mt-1 h-4 w-20 rounded-md" />
            </div>
          </div>
        </div>
        <div className="hidden md:block">
            <Skeleton className="h-5 w-64 rounded-md" />
        </div>
      </header>
      <main className="flex-1 overflow-hidden bg-black/90 flex items-center justify-center">
         <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </main>
    </div>
  );
}

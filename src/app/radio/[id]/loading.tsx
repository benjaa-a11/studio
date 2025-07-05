import { Skeleton } from "@/components/ui/skeleton";

export default function RadioPlayerLoading() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-40 w-40 rounded-lg" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

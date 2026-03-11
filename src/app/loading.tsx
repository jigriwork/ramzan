import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-56 rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>
  );
}

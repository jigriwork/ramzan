import { Skeleton } from '@/components/ui/skeleton';

export default function AppLoading() {
  return (
    <div className="space-y-6 pb-24">
      <Skeleton className="h-10 w-44 rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-[2rem]" />
    </div>
  );
}

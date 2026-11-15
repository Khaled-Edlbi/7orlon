import { Skeleton } from "@/components/ui/skeleton";

/** What the page looks like while the collection is still on its way. */
export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-[clamp(20px,5vw,72px)] pt-[clamp(28px,6vh,80px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,6vw,96px)]">
        <div className="flex max-w-[600px] flex-col gap-[var(--space-4)]">
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-[clamp(46px,7vw,104px)] w-full" />
          <Skeleton className="h-[clamp(46px,7vw,104px)] w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-[var(--space-2)]">
            <Skeleton className="h-14 w-52" />
            <Skeleton className="h-14 w-48" />
          </div>
        </div>
        <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[520px]" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-[clamp(20px,5vw,72px)] py-[clamp(24px,5vh,64px)]">
      <Skeleton className="h-[min(70vh,620px)] w-full" />
      <div className="mt-[clamp(40px,7vh,80px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-[clamp(32px,6vw,96px)]">
        <div className="flex flex-col gap-[var(--space-4)]">
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex flex-col gap-[var(--space-3)]">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArtistSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-[clamp(20px,5vw,72px)] pt-[clamp(28px,6vh,80px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,6vw,96px)]">
        <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[460px]" />
        <div className="flex max-w-[600px] flex-col gap-[var(--space-4)]">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-[clamp(44px,6vw,92px)] w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}

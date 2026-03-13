import { cn } from "../../lib/utils"

/* ─── Skeleton 加载态 ─── */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/60", className)}
      {...props}
    />
  )
}

/* ─── 预设骨架屏模式 ─── */

/** 统计卡片骨架 */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

/** 列表项骨架 */
function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-5">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

/** 文章卡片骨架 */
function SkeletonArticleCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-3">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

/** Dashboard 页面骨架 */
function SkeletonDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div>
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonListItem, SkeletonArticleCard, SkeletonDashboard }

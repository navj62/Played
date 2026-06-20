export function SkeletonCard() {
  return (
    <div className="w-72 flex-shrink-0">
      <div className="aspect-video skeleton rounded-sm" />
      <div className="flex gap-3 mt-3">
        <div className="w-8 h-8 rounded-full skeleton flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 skeleton rounded w-full" />
          <div className="h-3.5 skeleton rounded w-4/5" />
          <div className="h-3 skeleton rounded w-3/5 mt-1" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonVideoPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-6 py-6 max-w-screen-2xl mx-auto">
      <div className="flex-1 min-w-0">
        <div className="aspect-video skeleton rounded-sm" />
        <div className="mt-4 space-y-3">
          <div className="h-5 skeleton rounded w-4/5" />
          <div className="h-5 skeleton rounded w-3/5" />
          <div className="flex gap-3 mt-4">
            <div className="w-10 h-10 rounded-full skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton rounded w-40" />
              <div className="h-3 skeleton rounded w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 xl:w-96 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-36 aspect-video skeleton rounded-sm flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 skeleton rounded" />
              <div className="h-3.5 skeleton rounded w-4/5" />
              <div className="h-3 skeleton rounded w-1/2 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5 px-4 lg:px-6">
        <div className="w-1 h-5 bg-ct-border rounded-full" />
        <div className="h-5 skeleton rounded w-36" />
      </div>
      <div className="flex gap-4 overflow-hidden px-4 lg:px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  )
}

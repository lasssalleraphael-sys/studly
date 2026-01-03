'use client'

export function SkeletonCard() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-20 rounded mb-2" />
      <div className="skeleton h-4 w-28 rounded" />
    </div>
  )
}

export function SkeletonRecording() {
  return (
    <div className="p-5 border-b border-slate-800 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="skeleton h-5 w-48 rounded mb-2" />
          <div className="flex gap-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-10 w-72 rounded" />
        <div className="skeleton h-5 w-48 rounded" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      {/* Recent recordings */}
      <div className="space-y-4">
        <div className="skeleton h-6 w-40 rounded" />
        <div className="glass-card overflow-hidden">
          <SkeletonRecording />
          <SkeletonRecording />
          <SkeletonRecording />
        </div>
      </div>
    </div>
  )
}

export function SkeletonNotes() {
  return (
    <div className="space-y-4 fade-in">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="skeleton h-6 w-64 rounded" />
              <div className="flex gap-3">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonUsage() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-5 w-12 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-4 w-40 rounded" />
      </div>
      <div className="mt-4 skeleton h-3 w-full rounded-full" />
    </div>
  )
}

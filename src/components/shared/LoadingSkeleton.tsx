export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 animate-pulse">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="mt-4 space-y-2">
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="p-5 space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

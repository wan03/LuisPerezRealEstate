'use client';

/**
 * Lightweight skeleton components for content-aware loading states.
 * These match the final layout shape to eliminate layout shift.
 */

export function SkeletonBox({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`bg-slate-200 rounded-2xl animate-pulse ${className}`} style={style} />
    );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="bg-slate-200 rounded-full animate-pulse h-3"
                    style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

/** Skeleton for CommandCenter's milestone roadmap */
export function CommandCenterSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <SkeletonBox className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-48 rounded-full" />
                    <SkeletonBox className="h-3 w-32 rounded-full" />
                </div>
            </div>
            {/* Milestone steps */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                    <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-3/4 rounded-full" />
                        <SkeletonBox className="h-3 w-1/2 rounded-full" />
                    </div>
                    <SkeletonBox className="w-16 h-6 rounded-full" />
                </div>
            ))}
        </div>
    );
}

/** Skeleton for AnalyticsDashboard's KPI cards and chart */
export function AnalyticsSkeleton() {
    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                        <SkeletonBox className="h-3 w-20 rounded-full" />
                        <SkeletonBox className="h-8 w-28 rounded-xl" />
                        <SkeletonBox className="h-3 w-16 rounded-full" />
                    </div>
                ))}
            </div>
            {/* Bar Chart Area */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <SkeletonBox className="h-4 w-32 rounded-full mb-6" />
                <div className="flex items-end gap-3 h-32">
                    {[60, 80, 40, 70, 90, 50, 75].map((h, i) => (
                        <SkeletonBox key={i} className="flex-1 rounded-xl" style={{ height: `${h}%` } as React.CSSProperties} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Skeleton for UnifiedInbox chat room cards */
export function InboxSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
                    <SkeletonBox className="w-12 h-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-32 rounded-full" />
                        <SkeletonBox className="h-3 w-48 rounded-full" />
                    </div>
                    <SkeletonBox className="w-8 h-4 rounded-full" />
                </div>
            ))}
        </div>
    );
}

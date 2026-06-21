'use client';

/**
 * Lightweight skeleton components for content-aware loading states.
 * These match the final layout shape to eliminate layout shift.
 */

export function SkeletonBox({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`bg-panel2 animate-pulse ${className}`} style={style} />
    );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="bg-panel2 animate-pulse h-3"
                    style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

/** Skeleton for CommandCenter's milestone roadmap */
export function CommandCenterSkeleton() {
    return (
        <div className="bg-panel border border-line p-8 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <SkeletonBox className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-48" />
                    <SkeletonBox className="h-3 w-32" />
                </div>
            </div>
            {/* Milestone steps */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                    <SkeletonBox className="w-12 h-12 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-3/4" />
                        <SkeletonBox className="h-3 w-1/2" />
                    </div>
                    <SkeletonBox className="w-16 h-6" />
                </div>
            ))}
        </div>
    );
}

/** Skeleton for AnalyticsDashboard's KPI cards and chart */
export function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-panel p-6 border border-line space-y-3">
                        <SkeletonBox className="h-10 w-28" />
                        <SkeletonBox className="h-3 w-20" />
                    </div>
                ))}
            </div>
            {/* Bar Chart Area */}
            <div className="bg-panel p-6 border border-line">
                <SkeletonBox className="h-4 w-32 mb-6" />
                <div className="flex items-end gap-3 h-32">
                    {[60, 80, 40, 70, 90, 50, 75].map((h, i) => (
                        <SkeletonBox key={i} className="flex-1" style={{ height: `${h}%` } as React.CSSProperties} />
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
                <div key={i} className="flex items-center gap-4 p-4 border border-line bg-panel">
                    <SkeletonBox className="w-10 h-10 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-4 w-32" />
                        <SkeletonBox className="h-3 w-48" />
                    </div>
                    <SkeletonBox className="w-2.5 h-2.5" />
                </div>
            ))}
        </div>
    );
}

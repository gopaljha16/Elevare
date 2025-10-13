import React from 'react';
import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Card Skeleton
const CardSkeleton = () => (
  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  </div>
);

// Bento Grid Skeleton
const BentoSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "rounded-2xl bg-muted animate-pulse",
          i === 0 && "md:col-span-2 md:row-span-2",
          i === 3 && "lg:col-span-2",
          i === 6 && "md:col-span-2"
        )}
      />
    ))}
  </div>
);

// Dashboard Skeleton
const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Bento Grid */}
    <BentoSkeleton />
  </div>
);

export { Skeleton, CardSkeleton, BentoSkeleton, DashboardSkeleton };
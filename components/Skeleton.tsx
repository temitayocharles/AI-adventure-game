
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}></div>
  );
};

export const WorldCardSkeleton: React.FC = () => (
  <div className="relative rounded-3xl overflow-hidden shadow-xl h-64 bg-white dark:bg-slate-800">
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700/50 animate-pulse"></div>
    <div className="relative p-8 flex flex-col gap-4 h-full z-10">
      <div className="flex gap-4 items-center">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-auto flex gap-3">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-16 h-16 rounded-2xl" />
      </div>
    </div>
  </div>
);

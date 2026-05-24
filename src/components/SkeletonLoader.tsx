import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner Skeletons */}
      <div className="h-36 w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full">
          <div className="w-16 h-16 rounded-full bg-neutral-800 shrink-0" />
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-neutral-800 rounded w-3/4" />
            <div className="h-3 bg-neutral-800 rounded w-1/2" />
          </div>
        </div>
        <div className="w-24 h-12 bg-neutral-800 rounded-xl" />
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main skeleton cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <div className="h-4 bg-neutral-800 rounded w-1/4" />
            <div className="h-20 bg-neutral-800 rounded w-full" />
            <div className="flex space-x-2">
              <div className="h-6 bg-neutral-800 rounded w-16" />
              <div className="h-6 bg-neutral-800 rounded w-20" />
              <div className="h-6 bg-neutral-800 rounded w-16" />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <div className="h-4 bg-neutral-800 rounded w-1/3" />
            <div className="h-24 bg-neutral-800 rounded w-full" />
          </div>
        </div>

        {/* Right side skeleton list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <div className="h-4 bg-neutral-800 rounded w-1/2" />
            <div className="space-y-3">
              <div className="h-16 bg-neutral-800 rounded w-full" />
              <div className="h-16 bg-neutral-805 rounded w-full" />
              <div className="h-16 bg-neutral-800 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

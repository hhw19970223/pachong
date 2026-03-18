'use client';

import React from 'react';
import { Search, RefreshCw, AlertCircle, Zap } from 'lucide-react';

export function SkillCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-20 rounded-full bg-white/10"></div>
        <div className="h-6 w-16 rounded-full bg-white/10"></div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-white/10"></div>
        <div className="flex-1">
          <div className="mb-2 h-5 w-32 rounded bg-white/10"></div>
          <div className="h-4 w-20 rounded bg-white/10"></div>
        </div>
      </div>
      
      <div className="mb-4 h-12 w-full rounded bg-white/10"></div>
      
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 rounded-full bg-white/10"></div>
        <div className="h-6 w-20 rounded-full bg-white/10"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-16 w-full rounded-3xl bg-white/10"></div>
        <div className="h-16 w-full rounded-3xl bg-white/10"></div>
      </div>
      
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-full bg-white/10"></div>
        <div className="h-11 w-11 rounded-full bg-white/10"></div>
        <div className="h-11 w-11 rounded-full bg-white/10"></div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkillCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function LoadingState({ message = "Loading skills..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
          <Zap className="h-8 w-8 text-cyan-200" />
        </div>
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-cyan-300/10 border-t-cyan-300"></div>
      </div>
      <h3 className="mb-2 text-lg font-medium text-white">{message}</h3>
      <p className="max-w-md text-slate-400">
        Fetching the latest AI skills from Skills.sh. This may take a few moments.
      </p>
    </div>
  );
}

export function EmptyState({ 
  searchTerm, 
  onClearSearch,
  onRefresh 
}: { 
  searchTerm?: string;
  onClearSearch?: () => void;
  onRefresh?: () => void;
}) {
  const isSearchResult = !!searchTerm;
  
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Search className="h-8 w-8 text-slate-500" />
      </div>
      
      {isSearchResult ? (
        <>
          <h3 className="mb-2 text-lg font-medium text-white">
            No skills found
          </h3>
          <p className="mb-6 max-w-md text-slate-400">
            No skills match your search for{' '}
            <span className="font-medium text-white">{searchTerm}</span>. Try
            adjusting your search terms or filters.
          </p>
          <div className="flex gap-3">
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="min-h-11 rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-100"
              >
                Clear Search
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h3 className="mb-2 text-lg font-medium text-white">
            No skills available
          </h3>
          <p className="mb-6 max-w-md text-slate-400">
            There are no skills available at the moment. This might be a temporary issue.
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-100"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function ErrorState({ 
  message = "Something went wrong", 
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-400/10">
        <AlertCircle className="h-8 w-8 text-red-300" />
      </div>
      
      <h3 className="mb-2 text-lg font-medium text-white">
        Oops! Something went wrong
      </h3>
      <p className="mb-6 max-w-md text-slate-400">
        {message}. Please try refreshing the page or check back later.
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-100"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/10 border-t-cyan-300`} />
  );
}
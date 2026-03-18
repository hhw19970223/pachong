'use client';

import React from 'react';
import { Search, RefreshCw, AlertCircle, Zap } from 'lucide-react';

// Loading skeleton for skill cards
export function SkillCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-8 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="w-full h-12 bg-gray-200 rounded mb-4"></div>
      
      <div className="flex gap-2 mb-4">
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="w-full h-5 bg-gray-200 rounded"></div>
        <div className="w-full h-5 bg-gray-200 rounded"></div>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Grid of loading skill cards
export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkillCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Loading state with message
export function LoadingState({ message = "Loading skills..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 text-center max-w-md">
        Fetching the latest AI skills from Skills.sh. This may take a few moments.
      </p>
    </div>
  );
}

// Empty state when no skills found
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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      
      {isSearchResult ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No skills found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            No skills match your search for "<strong>{searchTerm}</strong>". 
            Try adjusting your search terms or filters.
          </p>
          <div className="flex gap-3">
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No skills available
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            There are no skills available at the moment. This might be a temporary issue.
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Error state
export function ErrorState({ 
  message = "Something went wrong", 
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {message}. Please try refreshing the page or check back later.
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Inline loading spinner
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`} />
  );
}
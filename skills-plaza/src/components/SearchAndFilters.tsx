'use client';

import React from 'react';
import { Search, Filter, SortAsc, RefreshCw } from 'lucide-react';
import { SortOption, FilterOption } from '@/types/skill';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  isLoading = false,
  onRefresh,
  totalCount,
  filteredCount,
}: SearchAndFiltersProps) {
  const sortOptions = [
    { value: 'rank' as SortOption, label: 'By Ranking' },
    { value: 'name' as SortOption, label: 'By Name' },
    { value: 'stars' as SortOption, label: 'By Stars' },
    { value: 'installs' as SortOption, label: 'By Downloads' },
    { value: 'recent' as SortOption, label: 'Recently Added' },
  ];

  const filterOptions = [
    { value: 'all' as FilterOption, label: 'All Skills', count: totalCount },
    { value: 'verified' as FilterOption, label: 'Verified Only' },
    { value: 'popular' as FilterOption, label: 'Popular (50K+ downloads)' },
    { value: 'new' as FilterOption, label: 'New (Last 30 days)' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search skills by name, owner, description, or tags..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => onFilterChange(e.target.value as FilterOption)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-sm text-gray-600">
            {filteredCount === totalCount ? (
              <span>Showing all <strong>{totalCount}</strong> skills</span>
            ) : (
              <span>
                Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> skills
                {searchTerm && (
                  <span> matching "<strong>{searchTerm}</strong>"</span>
                )}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Issues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
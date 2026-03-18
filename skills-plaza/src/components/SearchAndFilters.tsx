'use client';

import React from 'react';
import { Filter, RefreshCw, Search, SortAsc } from 'lucide-react';
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
    { value: 'rank' as SortOption, label: 'Ranking' },
    { value: 'name' as SortOption, label: 'Name' },
    { value: 'stars' as SortOption, label: 'Stars' },
    { value: 'installs' as SortOption, label: 'Installs' },
    { value: 'recent' as SortOption, label: 'Recently added' },
  ];

  const filterOptions = [
    { value: 'all' as FilterOption, label: 'All skills', count: totalCount },
    { value: 'verified' as FilterOption, label: 'Verified' },
    { value: 'popular' as FilterOption, label: 'Popular' },
    { value: 'new' as FilterOption, label: 'New in 30d' },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_30px_100px_rgba(3,7,18,0.38)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by skill name, owner, repository, summary, or tag"
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-12 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300/40"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const isActive = option.value === filterBy;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFilterChange(option.value)}
                    className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? 'border-cyan-300/40 bg-cyan-300/12 text-cyan-100'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {option.label}
                    {option.count !== undefined ? ` (${option.count})` : ''}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor="sort-skills">
                Sort skills
              </label>
              <div className="relative">
                <select
                  id="sort-skills"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className="min-h-11 appearance-none rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 pr-10 text-sm text-slate-200 outline-none transition hover:border-white/20"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort by {option.label}
                    </option>
                  ))}
                </select>
                <SortAsc className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <Filter className="h-4 w-4 text-cyan-200" />
              {filteredCount === totalCount ? (
                <span>Showing all {totalCount} skills</span>
              ) : (
                <span>
                  Showing {filteredCount} of {totalCount}
                  {searchTerm ? ` for "${searchTerm}"` : ''}
                </span>
              )}
            </div>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                Refresh
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
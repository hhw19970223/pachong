'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Skill, SortOption, FilterOption } from '@/types/skill';
import { SkillsApiService } from '@/services/skillsApi';
import { sortSkills, filterSkills } from '@/lib/utils';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { SkillCard } from '@/components/SkillCard';
import { SkillModal } from '@/components/SkillModal';
import { LoadingState, EmptyState, ErrorState } from '@/components/LoadingStates';
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Shield, 
  Github,
  ExternalLink,
  Heart
} from 'lucide-react';

export default function SkillsPlaza() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load skills data
  const loadSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try cached first, fallback to live data
      const data = await SkillsApiService.getCachedSkills();
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
      setError('Failed to load skills data. Please try again.');
      
      // Use fallback data as last resort
      const fallbackData = SkillsApiService.getFallbackData();
      setSkills(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // Apply filters and sorting
  const processedSkills = useMemo(() => {
    const filtered = filterSkills(skills, filterBy, searchTerm);
    return sortSkills(filtered, sortBy);
  }, [skills, filterBy, searchTerm, sortBy]);

  // Handle skill selection
  const handleViewDetails = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSkill(null);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalDownloads = skills.reduce((sum, skill) => sum + skill.stats.installsWeekly, 0);
    const totalStars = skills.reduce((sum, skill) => sum + skill.stats.stars, 0);
    const verifiedCount = skills.filter(skill => 
      skill.audits.every(audit => audit.status === 'Pass')
    ).length;
    
    return {
      totalSkills: skills.length,
      totalDownloads,
      totalStars,
      verifiedCount
    };
  }, [skills]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading AI Skills Plaza..." />
        </div>
      </div>
    );
  }

  if (error && skills.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={loadSkills} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  AI Skills Plaza
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Discover, explore, and install powerful AI agent skills
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a 
                href="http://98.88.137.186:3001/api/skills/cache"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                API
              </a>
              <a 
                href="https://github.com/hhw19970223/pachong"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <Github className="w-4 h-4" />
                Source
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSkills}</div>
              <div className="text-xs text-gray-600 mt-1">Total Skills</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-green-600">
                {(stats.totalDownloads / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600 mt-1">Weekly Downloads</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-yellow-600">
                {(stats.totalStars / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-600 mt-1">GitHub Stars</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl font-bold text-purple-600">{stats.verifiedCount}</div>
              <div className="text-xs text-gray-600 mt-1">Verified Skills</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          isLoading={isLoading}
          onRefresh={loadSkills}
          totalCount={skills.length}
          filteredCount={processedSkills.length}
        />

        {/* Skills Grid */}
        {processedSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedSkills.map((skill) => (
              <SkillCard
                key={skill.slug}
                skill={skill}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
            onRefresh={loadSkills}
          />
        )}

        {/* Featured Highlights */}
        {processedSkills.length > 0 && !searchTerm && (
          <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                Featured This Week
              </h2>
              <p className="text-blue-100">
                Most popular and trending AI skills
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <h3 className="font-semibold mb-2">Most Downloaded</h3>
                <p className="text-sm text-blue-100 mb-2">
                  {processedSkills[0]?.name}
                </p>
                <p className="text-xs text-blue-200">
                  {processedSkills[0]?.stats.installsWeeklyText} weekly downloads
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20">
                <Users className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                <h3 className="font-semibold mb-2">Most Starred</h3>
                <p className="text-sm text-blue-100 mb-2">
                  {[...processedSkills].sort((a, b) => b.stats.stars - a.stats.stars)[0]?.name}
                </p>
                <p className="text-xs text-blue-200">
                  {([...processedSkills].sort((a, b) => b.stats.stars - a.stats.stars)[0]?.stats.stars || 0).toLocaleString()} stars
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20">
                <Shield className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <h3 className="font-semibold mb-2">Most Secure</h3>
                <p className="text-sm text-blue-100 mb-2">
                  All verified skills
                </p>
                <p className="text-xs text-blue-200">
                  {stats.verifiedCount} skills with perfect audit scores
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">AI Skills Plaza</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Powered by Skills.sh API • Built with Next.js and TypeScript
            </p>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for the AI community</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Skill Detail Modal */}
      <SkillModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
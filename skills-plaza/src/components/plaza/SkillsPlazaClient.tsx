'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { siteConfig } from '@/config/site';
import {
  filterSkills,
  formatNumber,
  getOverallAuditStatus,
  sortSkills,
} from '@/lib/utils';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/LoadingStates';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { SkillCard } from '@/components/SkillCard';
import { SkillModal } from '@/components/SkillModal';
import { SkillsApiService } from '@/services/skillsApi';
import { FilterOption, Skill, SortOption } from '@/types/skill';
import { HeroSection } from './HeroSection';
import { SpotlightDeck, type SpotlightItem } from './SpotlightDeck';

interface SkillsPlazaClientProps {
  initialSkills: Skill[];
}

export function SkillsPlazaClient({ initialSkills }: SkillsPlazaClientProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [isRefreshing, setIsRefreshing] = useState(initialSkills.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const refreshSkills = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const nextSkills = await SkillsApiService.getCachedSkills();
      setSkills(nextSkills);
      setError(null);
    } catch (refreshError) {
      console.error('Failed to refresh skills:', refreshError);
      setError('We could not refresh the live feed right now.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialSkills.length === 0) {
      void refreshSkills();
    }
  }, [initialSkills.length, refreshSkills]);

  const processedSkills = useMemo(() => {
    return sortSkills(filterSkills(skills, filterBy, searchTerm), sortBy);
  }, [filterBy, searchTerm, skills, sortBy]);

  const stats = useMemo(() => {
    const owners = new Set(skills.map((skill) => skill.owner));

    return {
      totalSkills: skills.length,
      totalStars: skills.reduce((sum, skill) => sum + skill.stats.stars, 0),
      verifiedCount: skills.filter(
        (skill) => getOverallAuditStatus(skill.audits) === 'Pass'
      ).length,
      ownerCount: owners.size,
    };
  }, [skills]);

  const spotlightItems = useMemo<SpotlightItem[]>(() => {
    const topInstalled = sortSkills(skills, 'installs')[0];
    const topStarred = sortSkills(skills, 'stars')[0];
    const newest = sortSkills(skills, 'recent')[0];

    return [
      topInstalled
        ? {
            title: 'Most installed',
            description: 'The catalog entry currently pulling the strongest weekly demand.',
            metric: `${topInstalled.stats.installsWeeklyText} / week`,
            skill: topInstalled,
          }
        : null,
      topStarred
        ? {
            title: 'Most starred',
            description: 'A strong open-source signal and a popular pick for repeat installs.',
            metric: `${formatNumber(topStarred.stats.stars)} GitHub stars`,
            skill: topStarred,
          }
        : null,
      newest
        ? {
            title: 'Recently added',
            description: 'New work entering the plaza, useful when you want fresh experiments.',
            metric: newest.firstSeen,
            skill: newest,
          }
        : null,
    ].filter((item): item is SpotlightItem => Boolean(item));
  }, [skills]);

  if (isRefreshing && skills.length === 0) {
    return <LoadingState message="Loading the live skills marketplace..." />;
  }

  if (error && skills.length === 0) {
    return <ErrorState message={error} onRetry={refreshSkills} />;
  }

  return (
    <>
      <div className="relative">
        <HeroSection
          totalSkills={stats.totalSkills}
          totalStars={stats.totalStars}
          verifiedCount={stats.verifiedCount}
          ownerCount={stats.ownerCount}
          topSkill={sortSkills(skills, 'rank')[0] ?? null}
          isRefreshing={isRefreshing}
          onRefresh={refreshSkills}
        />

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
          <SpotlightDeck items={spotlightItems} onOpen={setSelectedSkill} />

          <section id="skills-grid" className="mt-8">
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
              isLoading={isRefreshing}
              onRefresh={refreshSkills}
              totalCount={skills.length}
              filteredCount={processedSkills.length}
            />

            {error ? (
              <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            {processedSkills.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {processedSkills.map((skill) => (
                  <SkillCard
                    key={skill.slug}
                    skill={skill}
                    onViewDetails={setSelectedSkill}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                searchTerm={searchTerm}
                onClearSearch={() => setSearchTerm('')}
                onRefresh={refreshSkills}
              />
            )}
          </section>
        </main>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>
              {siteConfig.name} pairs live ecosystem data with a cleaner reading
              experience for AI builders.
            </p>
            <div className="flex items-center gap-4">
              <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer">
                Source code
              </a>
              <span className="inline-flex items-center gap-2">
                Built with care
                <Heart className="h-4 w-4 text-rose-300" />
              </span>
            </div>
          </div>
        </footer>
      </div>

      <SkillModal
        key={selectedSkill ? `${selectedSkill.slug}-open` : 'skills-modal-closed'}
        skill={selectedSkill}
        isOpen={selectedSkill !== null}
        onClose={() => setSelectedSkill(null)}
      />
    </>
  );
}

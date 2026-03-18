import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FilterOption, Skill, SkillAudit, SortOption } from '@/types/skill';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatInstallsText(installs: number): string {
  return formatNumber(installs);
}

export function getAuditStatusColor(status: SkillAudit['status']): string {
  switch (status) {
    case 'Pass':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Warn':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Fail':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getOverallAuditStatus(audits: SkillAudit[]): SkillAudit['status'] {
  if (audits.some(audit => audit.status === 'Fail')) return 'Fail';
  if (audits.some(audit => audit.status === 'Warn')) return 'Warn';
  return 'Pass';
}

export function sortSkills(skills: Skill[], sortBy: SortOption): Skill[] {
  switch (sortBy) {
    case 'name':
      return skills.toSorted((a, b) => a.name.localeCompare(b.name));
    case 'stars':
      return skills.toSorted((a, b) => b.stats.stars - a.stats.stars);
    case 'installs':
      return skills.toSorted((a, b) => b.stats.installsWeekly - a.stats.installsWeekly);
    case 'recent':
      return skills.toSorted(
        (a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime()
      );
    case 'rank':
    default:
      return skills.toSorted((a, b) => a.rank - b.rank);
  }
}

export function filterSkills(
  skills: Skill[],
  filter: FilterOption,
  searchTerm: string
): Skill[] {
  let filtered = skills;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  switch (filter) {
    case 'verified':
      filtered = filtered.filter((skill) =>
        getOverallAuditStatus(skill.audits) === 'Pass'
      );
      break;
    case 'popular':
      filtered = filtered.filter((skill) =>
        skill.stats.installsWeekly > 50000
      );
      break;
    case 'new':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((skill) =>
        new Date(skill.firstSeen) > thirtyDaysAgo
      );
      break;
  }

  if (normalizedSearch) {
    filtered = filtered.filter((skill) =>
      skill.name.toLowerCase().includes(normalizedSearch) ||
      skill.owner.toLowerCase().includes(normalizedSearch) ||
      skill.repository.toLowerCase().includes(normalizedSearch) ||
      skill.summary.toLowerCase().includes(normalizedSearch) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
    );
  }

  return filtered;
}

export function getPlatformIcon(platform: string): string {
  const platformMap: Record<string, string> = {
    'github-copilot': '🐙',
    'opencode': '💻',
    'codex': '🤖', 
    'cursor': '⚡',
    'gemini-cli': '🔮',
    'claude-code': '🧠',
    'amp': '📱',
    'kimi-cli': '🌟',
  };
  return platformMap[platform] || '🔧';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}
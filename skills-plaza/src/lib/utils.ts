import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Skill, SkillAudit } from '@/types/skill';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatInstallsText(installs: number): string {
  if (installs >= 1000000) {
    return `${(installs / 1000000).toFixed(1)}M`;
  }
  if (installs >= 1000) {
    return `${(installs / 1000).toFixed(1)}K`;
  }
  return installs.toString();
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

export function sortSkills(skills: Skill[], sortBy: string): Skill[] {
  const sorted = [...skills];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'stars':
      return sorted.sort((a, b) => b.stats.stars - a.stats.stars);
    case 'installs':
      return sorted.sort((a, b) => b.stats.installsWeekly - a.stats.installsWeekly);
    case 'recent':
      return sorted.sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime());
    case 'rank':
    default:
      return sorted.sort((a, b) => a.rank - b.rank);
  }
}

export function filterSkills(skills: Skill[], filter: string, searchTerm: string): Skill[] {
  let filtered = [...skills];

  // Apply filter
  switch (filter) {
    case 'verified':
      filtered = filtered.filter(skill => 
        getOverallAuditStatus(skill.audits) === 'Pass'
      );
      break;
    case 'popular':
      filtered = filtered.filter(skill => 
        skill.stats.installsWeekly > 50000
      );
      break;
    case 'new':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(skill => 
        new Date(skill.firstSeen) > thirtyDaysAgo
      );
      break;
  }

  // Apply search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(skill =>
      skill.name.toLowerCase().includes(term) ||
      skill.owner.toLowerCase().includes(term) ||
      skill.summary.toLowerCase().includes(term) ||
      skill.tags.some(tag => tag.toLowerCase().includes(term))
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
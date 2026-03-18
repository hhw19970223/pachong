export interface SkillStats {
  installsWeekly: number;
  installsWeeklyText: string;
  stars: number;
}

export interface SkillAudit {
  name: string;
  status: 'Pass' | 'Warn' | 'Fail';
  url: string;
}

export interface SkillPlatform {
  platform: string;
  installs: number;
  installsText: string;
}

export interface SkillFile {
  html: string;
  rawText: string;
}

export interface Skill {
  source: string;
  rank: number;
  slug: string;
  name: string;
  owner: string;
  repository: string;
  detailUrl: string;
  stats: SkillStats;
  tags: string[];
  summary: string;
  installCommand: string;
  firstSeen: string;
  audits: SkillAudit[];
  installedOn: SkillPlatform[];
  skillFile: SkillFile;
  raw?: {
    repositoryUrl: string;
  };
}

export interface SkillsApiResponse {
  success: boolean;
  message: string;
  data: {
    result: {
      source: string;
      skills: Skill[];
      totalCount: number;
      scrapedAt: string;
    };
  };
  timestamp: string;
}

export type SortOption = 'rank' | 'name' | 'stars' | 'installs' | 'recent';
export type FilterOption = 'all' | 'verified' | 'popular' | 'new';
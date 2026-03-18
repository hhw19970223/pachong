import { Skill, SkillsApiResponse } from '@/types/skill';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://98.88.137.186:3001';

type CachedSkillsResponse = {
  data?: {
    sources?: Array<{
      source?: string;
      skills?: Skill[];
    }>;
  };
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

function dedupeSkills(skills: Skill[]): Skill[] {
  const seen = new Set<string>();

  return skills.filter((skill) => {
    if (seen.has(skill.slug)) {
      return false;
    }

    seen.add(skill.slug);
    return true;
  });
}

export class SkillsApiService {
  static async getSkills(source = 'skills.sh', limit = 50): Promise<Skill[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/skills/scrape?source=${source}&limit=${limit}`,
        {
          method: 'GET',
          headers: JSON_HEADERS,
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: SkillsApiResponse = await response.json();
      const skills = data.success ? data.data?.result?.skills ?? [] : [];

      if (skills.length === 0) {
        throw new Error(data.message || 'Failed to fetch skills data');
      }

      return dedupeSkills(skills);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      return this.getFallbackData();
    }
  }

  static async getCachedSkills(): Promise<Skill[]> {
    try {
      const response = await fetch(`${API_BASE}/api/skills/cache`, {
        method: 'GET',
        headers: JSON_HEADERS,
        cache: 'no-store',
      });


      console.log(response);

      if (!response.ok) {
        throw new Error(`Cache API error: ${response.status}`);
      }

    
      const data: CachedSkillsResponse = await response.json();
      console.log(data);
      const skills = (data.data?.sources ?? [])[0].skills ?? [];

      if (skills.length === 0) {
        throw new Error('No cached skills found');
      }

      return dedupeSkills(skills);
    } catch (error) {
      console.error('Failed to fetch cached skills:', error);
      return this.getSkills();
    }
  }

  static getFallbackData(): Skill[] {
    return [
      {
        source: "skills.sh",
        rank: 1,
        slug: "find-skills",
        name: "find-skills",
        owner: "vercel-labs",
        repository: "vercel-labs/skills",
        detailUrl: "https://skills.sh/vercel-labs/skills/find-skills",
        stats: {
          installsWeekly: 592200,
          installsWeeklyText: "592.2K",
          stars: 10600
        },
        tags: [],
        summary: "Discover and install skills for AI agents.",
        installCommand: "$ npx skills add https://github.com/vercel-labs/skills --skill find-skills",
        firstSeen: "Jan 26, 2026",
        audits: [
          { name: "Gen Agent Trust Hub", status: "Pass", url: "https://skills.sh/vercel-labs/skills/find-skills/security/agent-trust-hub" },
          { name: "Socket", status: "Warn", url: "https://skills.sh/vercel-labs/skills/find-skills/security/socket" },
          { name: "Snyk", status: "Pass", url: "https://skills.sh/vercel-labs/skills/find-skills/security/snyk" }
        ],
        installedOn: [
          { platform: "opencode", installs: 92200, installsText: "92.2K" },
          { platform: "codex", installs: 64300, installsText: "64.3K" },
          { platform: "github-copilot", installs: 58800, installsText: "58.8K" }
        ],
        skillFile: {
          html: "<p>A comprehensive skill discovery and installation system for AI agents.</p>",
          rawText: "A comprehensive skill discovery and installation system for AI agents."
        }
      },
      {
        source: "skills.sh",
        rank: 2,
        slug: "vercel-react-best-practices",
        name: "vercel-react-best-practices",
        owner: "vercel-labs",
        repository: "vercel-labs/agent-skills",
        detailUrl: "https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices",
        stats: {
          installsWeekly: 219600,
          installsWeeklyText: "219.6K",
          stars: 23200
        },
        tags: ["react", "best-practices"],
        summary: "React development best practices and patterns for building scalable applications.",
        installCommand: "$ npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices",
        firstSeen: "Jan 19, 2026",
        audits: [
          { name: "Gen Agent Trust Hub", status: "Pass", url: "#" },
          { name: "Socket", status: "Pass", url: "#" },
          { name: "Snyk", status: "Pass", url: "#" }
        ],
        installedOn: [
          { platform: "opencode", installs: 63100, installsText: "63.1K" },
          { platform: "codex", installs: 62400, installsText: "62.4K" }
        ],
        skillFile: {
          html: "<p>React best practices for professional development.</p>",
          rawText: "React best practices for professional development."
        }
      },
      {
        source: "skills.sh", 
        rank: 3,
        slug: "web-design-guidelines",
        name: "web-design-guidelines",
        owner: "vercel-labs",
        repository: "vercel-labs/agent-skills",
        detailUrl: "https://skills.sh/vercel-labs/agent-skills/web-design-guidelines",
        stats: {
          installsWeekly: 174100,
          installsWeeklyText: "174.1K",
          stars: 18500
        },
        tags: ["design", "web", "ui"],
        summary: "Comprehensive web design guidelines and UI/UX best practices.",
        installCommand: "$ npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines",
        firstSeen: "Jan 22, 2026",
        audits: [
          { name: "Gen Agent Trust Hub", status: "Pass", url: "#" },
          { name: "Socket", status: "Pass", url: "#" },
          { name: "Snyk", status: "Warn", url: "#" }
        ],
        installedOn: [
          { platform: "opencode", installs: 55100, installsText: "55.1K" },
          { platform: "cursor", installs: 48200, installsText: "48.2K" }
        ],
        skillFile: {
          html: "<p>Modern web design principles and guidelines.</p>",
          rawText: "Modern web design principles and guidelines."
        }
      },
      {
        source: "skills.sh",
        rank: 4,
        slug: "skill-creator",
        name: "skill-creator", 
        owner: "anthropics",
        repository: "anthropics/skills",
        detailUrl: "https://skills.sh/anthropics/skills/skill-creator",
        stats: {
          installsWeekly: 86800,
          installsWeeklyText: "86.8K",
          stars: 95100
        },
        tags: ["creator", "tools"],
        summary: "Create, test, and iterate on new AI agent skills with comprehensive evaluation tools.",
        installCommand: "$ npx skills add https://github.com/anthropics/skills --skill skill-creator",
        firstSeen: "Jan 19, 2026",
        audits: [
          { name: "Gen Agent Trust Hub", status: "Pass", url: "#" },
          { name: "Socket", status: "Pass", url: "#" },
          { name: "Snyk", status: "Pass", url: "#" }
        ],
        installedOn: [
          { platform: "opencode", installs: 69700, installsText: "69.7K" },
          { platform: "gemini-cli", installs: 65300, installsText: "65.3K" }
        ],
        skillFile: {
          html: "<p>Advanced skill creation and testing framework.</p>",
          rawText: "Advanced skill creation and testing framework."
        }
      }
    ];
  }
}
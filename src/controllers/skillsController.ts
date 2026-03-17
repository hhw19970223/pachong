import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { skillsDirectoryScraper } from '@/services/skillsShScraper';
import {
  ApiResponse,
  MultiSourceSkillsLeaderboard,
  SkillDirectorySource,
  SkillsLeaderboard,
} from '@/types';

type ScrapeSource = SkillDirectorySource | 'all';

interface ScrapeQuery {
  source?: string;
  limit?: string;
  includeDetails?: string;
}

export class SkillsController {
  getUsageInfo = asyncHandler(async (_req: Request, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      message: '技能目录抓取服务已就绪',
      data: {
        supportedSources: ['skills.sh', 'clawhub.ai'],
        endpoint: '/api/skills/scrape',
        query: {
          source: 'all | skills.sh | clawhub.ai',
          limit: '1-20，默认 10',
          includeDetails: 'true | false，默认 true',
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  scrapeTopSkills = asyncHandler(async (
    req: Request<{}, ApiResponse<SkillsLeaderboard | MultiSourceSkillsLeaderboard>, {}, ScrapeQuery>,
    res: Response<ApiResponse<SkillsLeaderboard | MultiSourceSkillsLeaderboard>>
  ) => {
    const limit = this.parseLimit(req.query.limit);
    const includeDetails = req.query.includeDetails !== 'false';
    const source = this.parseSource(req.query.source);

    let data: SkillsLeaderboard | MultiSourceSkillsLeaderboard;

    if (source === 'skills.sh') {
      data = await skillsDirectoryScraper.scrapeSkillsSh(limit, includeDetails);
    } else if (source === 'clawhub.ai') {
      data = await skillsDirectoryScraper.scrapeClawHub(limit, includeDetails);
    } else {
      data = await skillsDirectoryScraper.scrapeAllSources(limit, includeDetails);
    }

    res.json({
      success: true,
      message: `成功完成 ${source} 数据抓取`,
      data,
      timestamp: new Date().toISOString(),
    });
  });

  private parseLimit(rawLimit?: string): number {
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

    if (Number.isNaN(limit) || limit < 1 || limit > 20) {
      throw new Error('limit 必须是 1-20 之间的整数');
    }

    return limit;
  }

  private parseSource(rawSource?: string): ScrapeSource {
    if (!rawSource || rawSource === 'all') {
      return 'all';
    }

    if (rawSource === 'skills.sh' || rawSource === 'clawhub.ai') {
      return rawSource;
    }

    throw new Error('source 仅支持 all、skills.sh、clawhub.ai');
  }
}

export const skillsController = new SkillsController();

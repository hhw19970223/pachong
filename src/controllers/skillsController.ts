import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { skillsDirectoryScraper } from '@/services/skillsShScraper';
import { skillsCacheService } from '@/services/skillsCacheService';
import {
  ApiResponse,
  MultiSourceSkillsLeaderboard,
  SkillDirectorySource,
  SkillsCacheRecord,
  SkillsLeaderboard,
} from '@/types';

type ScrapeSource = SkillDirectorySource | 'all';

interface ScrapeQuery {
  source?: string;
  limit?: string;
  includeDetails?: string;
}

interface SkillsScrapeResponse {
  result: SkillsLeaderboard | MultiSourceSkillsLeaderboard;
  cache: SkillsCacheRecord;
}

export class SkillsController {
  getUsageInfo = asyncHandler(async (_req: Request, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      message: '技能目录抓取服务已就绪',
      data: {
        supportedSources: ['skills.sh', 'clawhub.ai'],
        endpoint: '/api/skills/scrape',
        cacheEndpoint: '/api/skills/cache',
        query: {
          source: 'all | skills.sh | clawhub.ai',
          limit: '1-1000，默认 10',
          includeDetails: 'true | false，默认 true',
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  scrapeTopSkills = asyncHandler(async (
    req: Request<{}, ApiResponse<SkillsScrapeResponse>, {}, ScrapeQuery>,
    res: Response<ApiResponse<SkillsScrapeResponse>>
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

    const cache = await skillsCacheService.save(source, data, {
      limit,
      includeDetails,
    });

    res.json({
      success: true,
      message: `成功完成 ${source} 数据抓取`,
      data: {
        result: data,
        cache,
      },
      timestamp: new Date().toISOString(),
    });
  });

  getCachedSkills = asyncHandler(async (
    req: Request<{}, ApiResponse<SkillsCacheRecord>, {}, ScrapeQuery>,
    res: Response<ApiResponse<SkillsCacheRecord>>
  ) => {
    const source = this.parseSource(req.query.source);
    const cache = await skillsCacheService.get(source);

    if (!cache) {
      res.status(404).json({
        success: false,
        message: `未找到 ${source} 的缓存数据，请先调用实时抓取接口`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.json({
      success: true,
      message: `成功获取 ${source} 的缓存数据`,
      data: cache,
      timestamp: new Date().toISOString(),
    });
  });

  private parseLimit(rawLimit?: string): number {
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;

    if (Number.isNaN(limit) || limit < 1 || limit > 1000) {
      throw new Error('limit 必须是 1-1000 之间的整数');
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

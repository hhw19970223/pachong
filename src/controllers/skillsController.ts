import { Request, Response } from 'express';
import { skillsShScraper, SkillsLeaderboard } from '@/services/skillsShScraper';
import { ApiResponse } from '@/types';
import logger from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { knownSkillRepositories, categorizedSkills, popularSkills } from '@/data/knownSkills';

export class SkillsController {
  /**
   * 爬取Skills.sh前N个技能
   */
  scrapeTopSkills = asyncHandler(async (req: Request, res: Response<ApiResponse<SkillsLeaderboard>>) => {
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (limit < 1 || limit > 50) {
      res.status(400).json({
        success: false,
        message: '限制数量必须在1-50之间',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.info(`开始爬取Skills.sh前${limit}个技能`);
    
    const result = await skillsShScraper.scrapeTopSkills(limit);
    
    res.json({
      success: true,
      message: `成功爬取${result.skills.length}个技能数据`,
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 爬取指定GitHub仓库列表的技能信息
   */
  scrapeSkillsFromRepos = asyncHandler(async (req: Request, res: Response<ApiResponse<SkillsLeaderboard>>) => {
    const { repositories } = req.body;
    
    if (!Array.isArray(repositories) || repositories.length === 0) {
      res.status(400).json({
        success: false,
        message: '请提供有效的仓库列表',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (repositories.length > 20) {
      res.status(400).json({
        success: false,
        message: '仓库数量不能超过20个',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.info(`开始爬取指定仓库技能信息，共${repositories.length}个`);
    
    const result = await skillsShScraper.scrapeSkillsFromRepos(repositories);
    
    res.json({
      success: true,
      message: `成功爬取${result.skills.length}个仓库的技能数据`,
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 爬取热门技能仓库
   */
  scrapePopularSkills = asyncHandler(async (req: Request, res: Response<ApiResponse<SkillsLeaderboard>>) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const selectedSkills = popularSkills.slice(0, Math.min(limit, 20));
    
    logger.info(`开始爬取${selectedSkills.length}个热门技能仓库`);
    
    const result = await skillsShScraper.scrapeSkillsFromRepos(selectedSkills);
    
    res.json({
      success: true,
      message: `成功爬取${result.skills.length}个热门技能数据`,
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 按分类爬取技能仓库
   */
  scrapeSkillsByCategory = asyncHandler(async (req: Request, res: Response<ApiResponse<SkillsLeaderboard>>) => {
    const category = req.params.category as string;
    const availableCategories = Object.keys(categorizedSkills);
    
    if (!availableCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: `无效的分类。可用分类: ${availableCategories.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const categorySkills = categorizedSkills[category as keyof typeof categorizedSkills];
    logger.info(`开始爬取"${category}"分类的${categorySkills.length}个技能仓库`);
    
    const result = await skillsShScraper.scrapeSkillsFromRepos(categorySkills);
    
    res.json({
      success: true,
      message: `成功爬取"${category}"分类的${result.skills.length}个技能数据`,
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 获取所有可用的技能分类
   */
  getSkillCategories = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const categories = Object.entries(categorizedSkills).map(([name, repos]) => ({
      name,
      count: repos.length,
      repositories: repos.slice(0, 3), // 只显示前3个作为示例
      totalRepositories: repos.length,
    }));

    res.json({
      success: true,
      message: '技能分类列表',
      data: {
        categories,
        totalCategories: categories.length,
        totalRepositories: knownSkillRepositories.length,
        popularCount: popularSkills.length,
      },
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 获取爬取的技能数据
   */
  getScrapedData = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const dataFilePath = path.join(process.cwd(), 'scraped-skills-data.json');
      
      if (!fs.existsSync(dataFilePath)) {
        res.status(404).json({
          success: false,
          message: '爬取数据文件不存在，请先执行数据爬取',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      
      res.json({
        success: true,
        message: '技能数据获取成功',
        data: data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '读取技能数据失败',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * 获取技能数据摘要
   */
  getDataSummary = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const dataFilePath = path.join(process.cwd(), 'scraped-skills-data.json');
      
      if (!fs.existsSync(dataFilePath)) {
        res.status(404).json({
          success: false,
          message: '爬取数据文件不存在，请先执行数据爬取',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      
      // 创建摘要数据
      const summary = {
        basicStats: {
          totalRepositories: data.totalRepositories,
          averageStars: data.averageStars,
          maxStars: data.maxStars,
          minStars: data.minStars,
          scrapedAt: data.scrapedAt
        },
        topProjects: data.topRepositoriesByStars.slice(0, 5),
        authorLeaderboard: Object.entries(data.authorStats)
          .sort(([,a], [,b]) => (b as any).totalStars - (a as any).totalStars)
          .slice(0, 5)
          .map(([author, stats]) => ({
            author,
            ...(stats as any)
          })),
        popularTags: data.tagAnalysis.mostCommonTags.slice(0, 10),
        categories: Object.keys(data.categories).map(category => ({
          name: category,
          description: data.categories[category].description,
          totalStars: data.categories[category].totalStars,
          skillCount: data.categories[category].skills.length
        }))
      };

      res.json({
        success: true,
        message: '技能数据摘要获取成功',
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '读取技能数据摘要失败',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * 按分类获取技能数据
   */
  getDataByCategory = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const category = req.params.category as string;
    const fs = require('fs');
    const path = require('path');
    
    try {
      const dataFilePath = path.join(process.cwd(), 'scraped-skills-data.json');
      
      if (!fs.existsSync(dataFilePath)) {
        res.status(404).json({
          success: false,
          message: '爬取数据文件不存在，请先执行数据爬取',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      
      if (!data.categories[category]) {
        const availableCategories = Object.keys(data.categories);
        res.status(404).json({
          success: false,
          message: `分类 "${category}" 不存在`,
          data: { availableCategories },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const categoryData = data.categories[category];
      
      res.json({
        success: true,
        message: `分类 "${category}" 数据获取成功`,
        data: {
          category,
          ...categoryData,
          metadata: {
            scrapedAt: data.scrapedAt,
            totalCategories: Object.keys(data.categories).length
          }
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '读取分类数据失败',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * 搜索技能数据
   */
  searchSkills = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { q, stars_min, stars_max, author, tag } = req.query;
    const fs = require('fs');
    const path = require('path');
    
    try {
      const dataFilePath = path.join(process.cwd(), 'scraped-skills-data.json');
      
      if (!fs.existsSync(dataFilePath)) {
        res.status(404).json({
          success: false,
          message: '爬取数据文件不存在，请先执行数据爬取',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      
      // 收集所有技能
      let allSkills: any[] = [];
      Object.values(data.categories).forEach((category: any) => {
        allSkills = allSkills.concat(category.skills);
      });

      // 应用搜索过滤器
      let filteredSkills = allSkills;

      if (q) {
        const query = (q as string).toLowerCase();
        filteredSkills = filteredSkills.filter(skill => 
          skill.title.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.author.toLowerCase().includes(query) ||
          (skill.tags && skill.tags.some((tag: string) => tag.toLowerCase().includes(query)))
        );
      }

      if (stars_min) {
        filteredSkills = filteredSkills.filter(skill => skill.stars >= parseInt(stars_min as string));
      }

      if (stars_max) {
        filteredSkills = filteredSkills.filter(skill => skill.stars <= parseInt(stars_max as string));
      }

      if (author) {
        filteredSkills = filteredSkills.filter(skill => 
          skill.author.toLowerCase().includes((author as string).toLowerCase())
        );
      }

      if (tag) {
        filteredSkills = filteredSkills.filter(skill => 
          skill.tags && skill.tags.some((t: string) => t.toLowerCase().includes((tag as string).toLowerCase()))
        );
      }

      // 按星标数降序排序
      filteredSkills.sort((a, b) => b.stars - a.stars);

      res.json({
        success: true,
        message: `搜索完成，找到 ${filteredSkills.length} 个匹配的技能`,
        data: {
          total: filteredSkills.length,
          skills: filteredSkills,
          query: { q, stars_min, stars_max, author, tag },
          scrapedAt: data.scrapedAt
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '搜索技能数据失败',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * 获取Skills.sh爬虫的使用说明
   */
  getUsageInfo = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const usageInfo = {
      description: 'AI技能仓库数据爬虫 - 获取GitHub上优质AI技能库的详细信息',
      爬虫接口: {
        'GET /skills/popular': {
          description: '爬取热门AI技能仓库',
          parameters: {
            limit: '限制数量 (1-20, 默认10)'
          },
          example: '/skills/popular?limit=5'
        },
        'GET /skills/categories': {
          description: '获取所有技能分类',
          example: '/skills/categories'
        },
        'GET /skills/category/:category': {
          description: '按分类爬取技能仓库',
          parameters: {
            category: 'AI/ML工具, 微软技能, OpenAI生态, 自动化代理, 技能平台, 开发工具, 云服务SDK'
          },
          example: '/skills/category/AI%2FML%E5%B7%A5%E5%85%B7'
        },
        'GET /skills/scrape': {
          description: '爬取Skills.sh前N个技能 (实验性)',
          parameters: {
            limit: '限制数量 (1-50, 默认10)'
          },
          example: '/skills/scrape?limit=10'
        },
        'POST /skills/scrape-repos': {
          description: '爬取指定GitHub仓库的技能信息',
          body: {
            repositories: ['owner/repo1', 'owner/repo2', '...']
          },
          example: {
            repositories: [
              'microsoft/semantic-kernel',
              'langchain-ai/langchain',
              'openai/openai-python'
            ]
          }
        }
      },
      数据查看接口: {
        'GET /skills/data': {
          description: '获取完整的爬取数据 (JSON格式)',
          example: '/skills/data'
        },
        'GET /skills/data/summary': {
          description: '获取数据摘要和统计信息',
          example: '/skills/data/summary'
        },
        'GET /skills/data/category/:category': {
          description: '按分类获取技能数据',
          parameters: {
            category: 'hotAISkills, skillsShRelated'
          },
          example: '/skills/data/category/hotAISkills'
        },
        'GET /skills/data/search': {
          description: '搜索技能数据',
          parameters: {
            q: '搜索关键词',
            stars_min: '最小星标数',
            stars_max: '最大星标数', 
            author: '作者筛选',
            tag: '标签筛选'
          },
          example: '/skills/data/search?q=ai&stars_min=1000&author=microsoft'
        }
      },
      dataFields: {
        rank: '排名',
        title: '技能名称',
        description: '描述',
        author: '作者',
        repository: '源码仓库地址',
        stars: '星标数',
        downloads: '下载量',
        tags: '标签',
        url: '链接',
        lastUpdated: '最后更新时间'
      },
      notes: [
        '爬取过程会自动从GitHub API获取详细信息',
        '请合理使用，避免过于频繁的请求',
        '部分数据可能需要时间来获取，请耐心等待'
      ]
    };

    res.json({
      success: true,
      message: 'Skills.sh爬虫使用说明',
      data: usageInfo,
      timestamp: new Date().toISOString(),
    });
  });
}

export const skillsController = new SkillsController();
import cheerio from 'cheerio';
import { httpClient } from '@/utils/httpClient';
import logger from '@/utils/logger';

export interface SkillData {
  rank: number;
  title: string;
  description: string;
  author: string;
  repository: string;
  stars: number;
  downloads?: string;
  tags?: string[];
  url: string;
  lastUpdated?: string;
}

export interface SkillsLeaderboard {
  skills: SkillData[];
  totalCount: number;
  scrapedAt: string;
}

export class SkillsShScraper {
  private readonly baseUrl = 'https://skills.sh';

  /**
   * 爬取Skills.sh前N个技能的详细信息
   * @param limit 限制数量，默认10
   */
  async scrapeTopSkills(limit: number = 10): Promise<SkillsLeaderboard> {
    try {
      logger.info(`开始爬取 Skills.sh 前 ${limit} 个技能...`);

      // 获取主页面
      const response = await httpClient.getWithRetry(this.baseUrl);
      const $ = cheerio.load(response.data);

      const skills: SkillData[] = [];
      let rank = 1;

      // 根据网站结构提取技能信息
      // 这里需要根据实际页面结构来调整选择器
      $('.skill-item, .skill-card, .leaderboard-item, [data-skill], .skill-row').each((index, element) => {
        if (rank > limit) return false;

        try {
          const $element = $(element);
          const skill = this.extractSkillData($element, $, rank);
          
          if (skill.title && skill.repository) {
            skills.push(skill);
            rank++;
            logger.debug(`提取技能: ${skill.title} (${skill.repository})`);
          }
        } catch (error) {
          logger.warn(`提取技能数据失败 (rank ${rank}):`, error);
        }
        
        return undefined; // 显式返回
      });

      // 如果上述选择器没有找到结果，尝试其他可能的结构
      if (skills.length === 0) {
        logger.info('未找到技能数据，尝试其他选择器...');
        await this.tryAlternativeExtraction($, skills, limit);
      }

      // 获取详细信息（如GitHub仓库数据）
      for (const skill of skills) {
        try {
          await this.enrichSkillData(skill);
        } catch (error) {
          logger.warn(`获取技能详细信息失败: ${skill.title}`, error);
        }
      }

      const result: SkillsLeaderboard = {
        skills,
        totalCount: skills.length,
        scrapedAt: new Date().toISOString(),
      };

      logger.info(`成功爬取 ${skills.length} 个技能数据`);
      return result;

    } catch (error) {
      logger.error('爬取 Skills.sh 失败:', error);
      throw error;
    }
  }

  /**
   * 从元素中提取技能数据
   */
  private extractSkillData($element: any, $: cheerio.CheerioAPI, rank: number): SkillData {
    // 尝试多种选择器来提取数据
    const title = this.extractText($element, [
      '.skill-title', 
      '.title', 
      'h3', 
      'h2', 
      '[data-title]',
      '.name'
    ]).trim();

    const description = this.extractText($element, [
      '.skill-description', 
      '.description', 
      '.desc', 
      'p',
      '[data-description]'
    ]).trim();

    const author = this.extractText($element, [
      '.author', 
      '.owner', 
      '.user', 
      '[data-author]',
      '.skill-author'
    ]).trim();

    // 提取仓库信息
    const repoLink = $element.find('a[href*="github.com"], a[href*="gitlab.com"], a[href*="bitbucket.org"]').first();
    let repository = repoLink.attr('href') || '';
    
    // 如果没找到链接，尝试从文本中提取
    if (!repository) {
      const repoText = this.extractText($element, ['.repo', '.repository', '.source']);
      const repoMatch = repoText.match(/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+/);
      if (repoMatch) {
        repository = `https://${repoMatch[0]}`;
      }
    }

    // 提取其他数据
    const stars = this.extractNumber($element, ['.stars', '.star-count', '[data-stars]']);
    const downloads = this.extractText($element, ['.downloads', '.download-count', '[data-downloads]']);
    
    // 提取标签
    const tags: string[] = [];
    $element.find('.tag, .badge, .label, .skill-tag').each((_: number, tagEl: any) => {
      const tag = $(tagEl).text().trim();
      if (tag) tags.push(tag);
    });

    const url = repoLink.attr('href') || $element.find('a').first().attr('href') || '';

    return {
      rank,
      title: title || `技能 ${rank}`,
      description: description || '',
      author: author || '',
      repository: repository || '',
      stars,
      downloads: downloads || undefined,
      tags: tags.length > 0 ? tags : undefined,
      url: url || '',
    };
  }

  /**
   * 尝试其他提取方法
   */
  private async tryAlternativeExtraction($: cheerio.CheerioAPI, skills: SkillData[], limit: number): Promise<void> {
    // 方法1: 查找包含GitHub链接的元素
    $('a[href*="github.com"]').each((index, element) => {
      if (skills.length >= limit) return false;

      const $element = $(element);
      const $parent = $element.closest('div, li, tr, section, article');
      
      const skill = this.extractSkillData($parent.length > 0 ? $parent : $element, $, skills.length + 1);
      if (skill.title && skill.repository && !skills.find(s => s.repository === skill.repository)) {
        skills.push(skill);
      }
      return undefined;
    });

    // 方法2: 查找列表项
    if (skills.length < limit) {
      $('li, .item, .entry').each((index, element) => {
        if (skills.length >= limit) return false;

        const $element = $(element);
        const text = $element.text();
        
        // 如果包含常见的技能相关关键词
        if (text.includes('github.com') || text.includes('skill') || text.includes('tool')) {
          const skill = this.extractSkillData($element, $, skills.length + 1);
          if (skill.repository && !skills.find(s => s.repository === skill.repository)) {
            skills.push(skill);
          }
        }
        return undefined;
      });
    }

    // 方法3: 从页面文本中提取GitHub链接
    if (skills.length < limit) {
      const pageText = $.text();
      const githubLinks = pageText.match(/https?:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+/g) || [];
      
      for (const link of githubLinks.slice(0, limit)) {
        if (skills.length >= limit) break;
        
        const parts = link.split('/');
        const author = parts[parts.length - 2];
        const repoName = parts[parts.length - 1];
        
        skills.push({
          rank: skills.length + 1,
          title: repoName.replace(/[\-_]/g, ' '),
          description: '',
          author,
          repository: link,
          stars: 0,
          url: link,
        });
      }
    }
  }

  /**
   * 丰富技能数据（从GitHub API获取更多信息）
   */
  private async enrichSkillData(skill: SkillData): Promise<void> {
    if (!skill.repository.includes('github.com')) return;

    try {
      // 从GitHub URL提取用户名和仓库名
      const match = skill.repository.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (!match) return;

      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

      logger.debug(`获取GitHub仓库信息: ${owner}/${repo}`);

      const response = await httpClient.get(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Skills-Scraper/1.0',
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        const repoData = response.data;
        
        // 更新技能数据
        skill.title = skill.title || repoData.name;
        skill.description = skill.description || repoData.description || '';
        skill.stars = repoData.stargazers_count || skill.stars;
        skill.lastUpdated = repoData.updated_at;
        
        // 提取标签
        if (repoData.topics && repoData.topics.length > 0) {
          skill.tags = [...(skill.tags || []), ...repoData.topics];
          skill.tags = [...new Set(skill.tags)]; // 去重
        }

        logger.debug(`GitHub数据获取成功: ${owner}/${repo} (${skill.stars} stars)`);
      }
    } catch (error) {
      // GitHub API失败不影响主要流程
      logger.warn(`获取GitHub数据失败: ${skill.repository}`, error);
    }
  }

  /**
   * 辅助方法：从多个选择器中提取文本
   */
  private extractText($element: any, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim();
      if (text) return text;
    }
    return $element.text().trim();
  }

  /**
   * 辅助方法：从多个选择器中提取数字
   */
  private extractNumber($element: any, selectors: string[]): number {
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim();
      const number = parseInt(text.replace(/[^\d]/g, ''));
      if (!isNaN(number)) return number;
    }
    return 0;
  }

  /**
   * 直接爬取指定GitHub仓库列表的技能信息
   */
  async scrapeSkillsFromRepos(repositories: string[]): Promise<SkillsLeaderboard> {
    logger.info(`爬取指定仓库技能信息，共 ${repositories.length} 个仓库`);
    
    const skills: SkillData[] = [];
    
    for (let i = 0; i < repositories.length; i++) {
      const repo = repositories[i];
      try {
        const skill: SkillData = {
          rank: i + 1,
          title: '',
          description: '',
          author: '',
          repository: repo.startsWith('http') ? repo : `https://github.com/${repo}`,
          stars: 0,
          url: repo.startsWith('http') ? repo : `https://github.com/${repo}`,
        };

        await this.enrichSkillData(skill);
        skills.push(skill);
        
        // 避免GitHub API限制
        if (i < repositories.length - 1) {
          await this.delay(1000);
        }
      } catch (error) {
        logger.warn(`处理仓库失败: ${repo}`, error);
      }
    }

    return {
      skills,
      totalCount: skills.length,
      scrapedAt: new Date().toISOString(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const skillsShScraper = new SkillsShScraper();
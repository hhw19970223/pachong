import * as cheerio from 'cheerio';
import { AxiosError } from 'axios';
import config from '@/config';
import { httpClient } from '@/utils/httpClient';
import logger from '@/utils/logger';
import {
  DirectorySkillEntry,
  MultiSourceSkillsLeaderboard,
  SkillAuditStatus,
  SkillDirectorySource,
  SkillInstallationMetric,
  SkillsLeaderboard,
} from '@/types';

interface ClawHubListItem {
  slug: string;
  displayName: string;
  summary?: string | null;
  tags?: Record<string, string>;
  stats?: Record<string, unknown>;
  createdAt?: number;
  updatedAt?: number;
  latestVersion?: {
    version: string;
    createdAt?: number;
    changelog?: string;
  } | null;
}

interface ClawHubListResponse {
  items: ClawHubListItem[];
  nextCursor: string | null;
}

interface ClawHubSkillResponse {
  skill?: ClawHubListItem | null;
  latestVersion?: {
    version: string;
    createdAt?: number;
    changelog?: string;
    license?: string | null;
  } | null;
  owner?: {
    handle?: string | null;
    displayName?: string | null;
    image?: string | null;
    userId?: string | null;
  } | null;
  metadata?: Record<string, unknown> | null;
  moderation?: {
    verdict?: string;
    summary?: string | null;
    reasonCodes?: string[];
    updatedAt?: number | null;
    isSuspicious?: boolean;
    isMalwareBlocked?: boolean;
  } | null;
}

interface ClawHubModerationResponse {
  moderation?: {
    verdict?: string;
    summary?: string | null;
    reasonCodes?: string[];
    updatedAt?: number | null;
    isSuspicious?: boolean;
    isMalwareBlocked?: boolean;
  } | null;
}

interface ClawHubScanResponse {
  security?: {
    status?: string;
    hasWarnings?: boolean;
    checkedAt?: number | null;
    hasScanResult?: boolean;
    virustotalUrl?: string | null;
  } | null;
}

export class SkillsDirectoryScraper {
  private readonly skillsShBaseUrl = 'https://skills.sh';
  private readonly clawHubBaseUrl = 'https://clawhub.ai';
  private readonly skillsShPathPattern = /^\/([^/?#]+)\/([^/?#]+)\/([^/?#]+)$/;

  async scrapeTopSkills(limit: number = 10): Promise<SkillsLeaderboard> {
    return this.scrapeSkillsSh(limit, true);
  }

  async scrapeSkillsSh(limit: number = 10, includeDetails: boolean = true): Promise<SkillsLeaderboard> {
    logger.info(`开始爬取 Skills.sh 热门技能，limit=${limit}, includeDetails=${includeDetails}`);

    const homepageHtml = await this.fetchSkillsShHomepageHtml();
    const $ = cheerio.load(homepageHtml);
    const detailUrls = this.extractSkillsShDetailUrls($).slice(0, limit);
    const skills: DirectorySkillEntry[] = [];

    for (const [index, detailUrl] of detailUrls.entries()) {
      const seed = this.createSkillsShSeed(detailUrl, index + 1);
      const skill = includeDetails ? await this.scrapeSkillsShDetail(seed) : seed;
      skills.push(skill);
      await this.delay(150);
    }

    logger.info(`Skills.sh 抓取完成，共 ${skills.length} 条`);
    return {
      source: 'skills.sh',
      skills,
      totalCount: skills.length,
      scrapedAt: new Date().toISOString(),
    };
  }

  async scrapeClawHub(limit: number = 10, includeDetails: boolean = true): Promise<SkillsLeaderboard> {
    logger.info(`开始爬取 ClawHub 热门技能，limit=${limit}, includeDetails=${includeDetails}`);

    const items: ClawHubListItem[] = [];
    let nextCursor: string | null = null;

    while (items.length < limit) {
      const pageLimit = Math.min(Math.max(limit - items.length, 10), 50);
      const query = new URLSearchParams({
        limit: String(pageLimit),
        sort: 'downloads',
      });

      if (nextCursor) {
        query.set('cursor', nextCursor);
      }

      const page = await this.getJson<ClawHubListResponse>(
        `${this.clawHubBaseUrl}/api/v1/skills?${query.toString()}`
      );

      if (!Array.isArray(page.items) || page.items.length === 0) {
        break;
      }

      items.push(...page.items);
      nextCursor = page.nextCursor;

      if (!nextCursor) {
        break;
      }

      await this.delay(200);
    }

    const selectedItems = items.slice(0, limit);
    const skills: DirectorySkillEntry[] = [];

    for (const [index, item] of selectedItems.entries()) {
      const seed = this.mapClawHubListItem(item, index + 1);
      const skill = includeDetails ? await this.scrapeClawHubDetail(seed) : seed;
      skills.push(skill);
      await this.delay(150);
    }

    logger.info(`ClawHub 抓取完成，共 ${skills.length} 条`);
    return {
      source: 'clawhub.ai',
      skills,
      totalCount: skills.length,
      scrapedAt: new Date().toISOString(),
      nextCursor,
    };
  }

  async scrapeAllSources(limit: number = 10, includeDetails: boolean = true): Promise<MultiSourceSkillsLeaderboard> {
    const [skillsSh, clawHub] = await Promise.all([
      this.scrapeSkillsSh(limit, includeDetails),
      this.scrapeClawHub(limit, includeDetails),
    ]);

    const combined = [...skillsSh.skills, ...clawHub.skills].sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }

      return left.source.localeCompare(right.source);
    });

    return {
      sources: [skillsSh, clawHub],
      combined,
      totalCount: combined.length,
      scrapedAt: new Date().toISOString(),
    };
  }

  private async fetchSkillsShHomepageHtml(): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.scraper.requestTimeout);

    try {
      const response = await fetch(this.skillsShBaseUrl, {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': config.scraper.userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`获取 Skills.sh 首页 HTML 失败: ${this.getErrorMessage(error)}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractSkillsShDetailUrls($: cheerio.CheerioAPI): string[] {
    const urls = new Set<string>();

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) {
        return;
      }

      const absoluteUrl = this.toAbsoluteUrl(this.skillsShBaseUrl, href);
      const pathname = new URL(absoluteUrl).pathname;

      if (!this.skillsShPathPattern.test(pathname)) {
        return;
      }

      urls.add(absoluteUrl);
    });

    return Array.from(urls);
  }

  private createSkillsShSeed(detailUrl: string, rank: number): DirectorySkillEntry {
    const parsed = new URL(detailUrl);
    const match = parsed.pathname.match(this.skillsShPathPattern);

    if (!match) {
      throw new Error(`无法解析 Skills.sh 详情路径: ${detailUrl}`);
    }

    const [, owner, repositoryName, slug] = match;

    return {
      source: 'skills.sh',
      rank,
      slug,
      name: this.humanizeSlug(slug),
      owner,
      repository: `${owner}/${repositoryName}`,
      detailUrl,
      stats: {},
      tags: [],
    };
  }

  private async scrapeSkillsShDetail(seed: DirectorySkillEntry): Promise<DirectorySkillEntry> {
    const response = await httpClient.getWithRetry(seed.detailUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    const $ = cheerio.load(response.data);
    const repositoryLink = $('a[href^="https://github.com/"]').first();
    const weeklyInstallsText = this.extractSkillsShInfoValue($, 'Weekly Installs');
    const starsText = this.extractSkillsShInfoValue($, 'GitHub Stars');
    const firstSeen = this.extractSkillsShInfoValue($, 'First Seen');
    const installedOn = this.extractSkillsShInstalledOn($);
    const audits = this.extractSkillsShAudits($);
    const prose = $('.prose').first();
    const proseText = prose.text().replace(/\n{3,}/g, '\n\n').trim();
    const proseHtml = prose.html()?.trim();

    return {
      ...seed,
      name: $('h1').first().text().trim() || seed.name,
      summary: $('meta[name="description"]').attr('content') || $('.prose p').first().text().trim() || seed.summary,
      repository: repositoryLink.text().trim() || seed.repository,
      installCommand: $('code').first().text().trim() || undefined,
      firstSeen: firstSeen || undefined,
      stats: {
        ...seed.stats,
        installsWeekly: this.parseHumanNumber(weeklyInstallsText),
        installsWeeklyText: weeklyInstallsText || undefined,
        stars: this.parseHumanNumber(starsText),
      },
      audits,
      installedOn,
      skillFile: {
        html: proseHtml,
        rawText: proseText || undefined,
      },
      raw: {
        repositoryUrl: repositoryLink.attr('href') || undefined,
      },
    };
  }

  private extractSkillsShInfoValue($: cheerio.CheerioAPI, label: string): string {
    const labelNode = $('span, div')
      .filter((_, element) => $(element).text().replace(/\s+/g, ' ').trim() === label)
      .first();

    if (!labelNode.length) {
      return '';
    }

    const section = labelNode.closest('div').parent();
    if (!section.length) {
      return '';
    }

    const value = section.children().eq(1).text().replace(/\s+/g, ' ').trim();
    return value;
  }

  private extractSkillsShInstalledOn($: cheerio.CheerioAPI): SkillInstallationMetric[] {
    const metrics: SkillInstallationMetric[] = [];
    const section = this.findSkillsShSection($, 'Installed on');

    if (!section.length) {
      return metrics;
    }

    section.find('div.flex.items-center.justify-between.text-sm.py-2').each((_, element) => {
      const row = $(element);
      const cells = row.children();
      const platform = cells.eq(0).text().trim();
      const installsText = cells.eq(1).text().trim();

      if (platform) {
        metrics.push({
          platform,
          installs: this.parseHumanNumber(installsText) || 0,
          installsText: installsText || undefined,
        });
      }
    });

    return metrics;
  }

  private extractSkillsShAudits($: cheerio.CheerioAPI): SkillAuditStatus[] {
    const audits: SkillAuditStatus[] = [];
    const section = this.findSkillsShSection($, 'Security Audits');

    if (!section.length) {
      return audits;
    }

    section.find('a[href*="/security/"]').each((_, element) => {
      const link = $(element);
      const name = link.find('span').first().text().trim();
      const status = link.find('span').last().text().trim();

      if (name && status) {
        audits.push({
          name,
          status,
          url: this.toAbsoluteUrl(this.skillsShBaseUrl, link.attr('href') || ''),
        });
      }
    });

    return audits;
  }

  private findSkillsShSection($: cheerio.CheerioAPI, label: string): cheerio.Cheerio<any> {
    const labelNode = $('div, span')
      .filter((_, element) => $(element).text().replace(/\s+/g, ' ').trim() === label)
      .first();

    if (!labelNode.length) {
      return cheerio.load('<div></div>')('div');
    }

    return labelNode.closest('div').parent();
  }

  private mapClawHubListItem(item: ClawHubListItem, rank: number): DirectorySkillEntry {
    const tags = Object.keys(item.tags || {});

    return {
      source: 'clawhub.ai',
      rank,
      slug: item.slug,
      name: item.displayName,
      summary: item.summary || undefined,
      detailUrl: `${this.clawHubBaseUrl}/skills/${item.slug}`,
      createdAt: this.toIsoString(item.createdAt),
      updatedAt: this.toIsoString(item.updatedAt),
      latestVersion: item.latestVersion?.version,
      latestVersionCreatedAt: this.toIsoString(item.latestVersion?.createdAt),
      changelog: item.latestVersion?.changelog,
      tags,
      stats: {
        downloads: this.toNumber(item.stats?.downloads),
        installsCurrent: this.toNumber(item.stats?.installsCurrent),
        installsAllTime: this.toNumber(item.stats?.installsAllTime),
        stars: this.toNumber(item.stats?.stars),
        versions: this.toNumber(item.stats?.versions),
        comments: this.toNumber(item.stats?.comments),
      },
      raw: {
        listItem: item,
      },
    };
  }

  private async scrapeClawHubDetail(seed: DirectorySkillEntry): Promise<DirectorySkillEntry> {
    const detail = await this.getJson<ClawHubSkillResponse>(
      `${this.clawHubBaseUrl}/api/v1/skills/${encodeURIComponent(seed.slug)}`
    );

    const moderation = await this.getOptionalJson<ClawHubModerationResponse>(
      `${this.clawHubBaseUrl}/api/v1/skills/${encodeURIComponent(seed.slug)}/moderation`
    );
    const scan = await this.getOptionalJson<ClawHubScanResponse>(
      `${this.clawHubBaseUrl}/api/v1/skills/${encodeURIComponent(seed.slug)}/scan`
    );
    const skillMarkdown = await this.getOptionalText(
      `${this.clawHubBaseUrl}/api/v1/skills/${encodeURIComponent(seed.slug)}/file?path=${encodeURIComponent('SKILL.md')}`
    );

    const detailSkill = detail.skill;
    const mergedTags = [...new Set([...(seed.tags || []), ...Object.keys(detailSkill?.tags || {})])];
    const moderationInfo = moderation?.moderation || detail.moderation || undefined;

    const audits: SkillAuditStatus[] = [];
    if (scan?.security?.status) {
      audits.push({
        name: 'Security Scan',
        status: scan.security.status,
        url: `${this.clawHubBaseUrl}/skills/${seed.slug}`,
      });
    }

    return {
      ...seed,
      name: detailSkill?.displayName || seed.name,
      owner: detail.owner?.handle || seed.owner,
      summary: detailSkill?.summary || seed.summary,
      createdAt: this.toIsoString(detailSkill?.createdAt) || seed.createdAt,
      updatedAt: this.toIsoString(detailSkill?.updatedAt) || seed.updatedAt,
      latestVersion: detail.latestVersion?.version || seed.latestVersion,
      latestVersionCreatedAt: this.toIsoString(detail.latestVersion?.createdAt) || seed.latestVersionCreatedAt,
      changelog: detail.latestVersion?.changelog || seed.changelog,
      tags: mergedTags,
      stats: {
        ...seed.stats,
        downloads: this.toNumber(detailSkill?.stats?.downloads) ?? seed.stats.downloads,
        installsCurrent: this.toNumber(detailSkill?.stats?.installsCurrent) ?? seed.stats.installsCurrent,
        installsAllTime: this.toNumber(detailSkill?.stats?.installsAllTime) ?? seed.stats.installsAllTime,
        stars: this.toNumber(detailSkill?.stats?.stars) ?? seed.stats.stars,
        versions: this.toNumber(detailSkill?.stats?.versions) ?? seed.stats.versions,
        comments: this.toNumber(detailSkill?.stats?.comments) ?? seed.stats.comments,
      },
      suspicious: moderationInfo?.isSuspicious ?? seed.suspicious,
      moderation: moderationInfo
        ? {
            verdict: moderationInfo.verdict,
            summary: moderationInfo.summary,
            reasonCodes: moderationInfo.reasonCodes,
            updatedAt: this.toIsoString(moderationInfo.updatedAt),
            isSuspicious: moderationInfo.isSuspicious,
            isMalwareBlocked: moderationInfo.isMalwareBlocked,
          }
        : undefined,
      audits,
      skillFile: skillMarkdown
        ? {
            markdown: skillMarkdown,
            rawText: skillMarkdown,
          }
        : undefined,
      raw: {
        detail,
        moderation,
        scan,
      },
    };
  }

  private async getJson<T>(url: string): Promise<T> {
    const response = await httpClient.getWithRetry(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    return response.data as T;
  }

  private async getOptionalJson<T>(url: string): Promise<T | undefined> {
    try {
      return await this.getJson<T>(url);
    } catch (error) {
      if (this.isNotFound(error)) {
        return undefined;
      }

      logger.warn(`请求可选 JSON 数据失败: ${url}`, error);
      return undefined;
    }
  }

  private async getOptionalText(url: string): Promise<string | undefined> {
    try {
      const response = await httpClient.getWithRetry(url, {
        headers: {
          Accept: 'text/plain',
        },
      });

      return typeof response.data === 'string' ? response.data.trim() : undefined;
    } catch (error) {
      if (this.isNotFound(error)) {
        return undefined;
      }

      logger.warn(`请求可选文本数据失败: ${url}`, error);
      return undefined;
    }
  }

  private isNotFound(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 404;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  private parseHumanNumber(value: string): number | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.replace(/,/g, '').trim().toUpperCase();
    const match = normalized.match(/(\d+(?:\.\d+)?)([KMB])?/);

    if (!match) {
      return undefined;
    }

    const base = parseFloat(match[1]);
    const unit = match[2];
    const multiplierMap: Record<string, number> = {
      K: 1_000,
      M: 1_000_000,
      B: 1_000_000_000,
    };

    return Math.round(base * (unit ? multiplierMap[unit] : 1));
  }

  private toNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }

  private toIsoString(value: number | null | undefined): string | undefined {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return undefined;
    }

    return new Date(value).toISOString();
  }

  private humanizeSlug(slug: string): string {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private toAbsoluteUrl(baseUrl: string, href: string): string {
    return new URL(href, baseUrl).toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const skillsDirectoryScraper = new SkillsDirectoryScraper();
export const skillsShScraper = skillsDirectoryScraper;

import { promises as fs } from 'fs';
import path from 'path';
import logger from '@/utils/logger';
import {
  MultiSourceSkillsLeaderboard,
  SkillDirectorySource,
  SkillsCacheRecord,
  SkillsCacheStore,
  SkillsLeaderboard,
} from '@/types';

type CacheSource = SkillDirectorySource | 'all';
type CachePayload = SkillsLeaderboard | MultiSourceSkillsLeaderboard;

export class SkillsCacheService {
  private readonly cacheDir = path.join(process.cwd(), 'cache');
  private readonly cacheFilePath = path.join(this.cacheDir, 'skills-directory-cache.json');

  async save(
    source: CacheSource,
    data: CachePayload,
    options: { limit: number; includeDetails: boolean }
  ): Promise<SkillsCacheRecord> {
    const store = await this.readStore();
    const record: SkillsCacheRecord = {
      source,
      limit: options.limit,
      includeDetails: options.includeDetails,
      cachedAt: new Date().toISOString(),
      data,
    };

    store.entries[source] = record;
    store.updatedAt = record.cachedAt;

    await this.writeStore(store);
    logger.info(`技能数据缓存写入成功: source=${source}`);

    return record;
  }

  async get(source: CacheSource): Promise<SkillsCacheRecord | null> {
    const store = await this.readStore();
    return store.entries[source] || null;
  }

  private async readStore(): Promise<SkillsCacheStore> {
    try {
      const content = await fs.readFile(this.cacheFilePath, 'utf8');
      const parsed = JSON.parse(content) as SkillsCacheStore;

      return {
        entries: parsed.entries || {},
        updatedAt: parsed.updatedAt || new Date(0).toISOString(),
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== 'ENOENT') {
        logger.warn('读取技能缓存失败，已回退到空缓存', error);
      }

      return {
        entries: {},
        updatedAt: new Date(0).toISOString(),
      };
    }
  }

  private async writeStore(store: SkillsCacheStore): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.writeFile(this.cacheFilePath, JSON.stringify(store, null, 2), 'utf8');
  }
}

export const skillsCacheService = new SkillsCacheService();

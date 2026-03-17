import cheerio from 'cheerio';
import { httpClient } from '@/utils/httpClient';
import logger from '@/utils/logger';
import { ScrapedData, TaskExecutionResult, WebhookPayload } from '@/types';

export class ScraperService {
  async scrapeData(
    url: string,
    selector?: string,
    headers?: Record<string, string>
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`开始抓取: ${url}`);

      const response = await httpClient.getWithRetry(url, {
        headers: headers || {},
      });

      const $ = cheerio.load(response.data);
      let data: ScrapedData[] | Record<string, unknown>;

      if (selector) {
        const items: ScrapedData[] = [];

        $(selector).each((_, element) => {
          const $element = $(element);
          const scrapedItem: ScrapedData = {
            text: $element.text().trim(),
            html: $element.html() || undefined,
            href: $element.attr('href') || undefined,
          };

          ['src', 'alt', 'title'].forEach((attribute) => {
            const value = $element.attr(attribute);
            if (value) {
              scrapedItem[attribute] = value;
            }
          });

          items.push(scrapedItem);
        });

        data = items;
        logger.info(`使用选择器 "${selector}" 提取到 ${items.length} 个元素`);
      } else {
        data = {
          title: $('title').text().trim(),
          description: $('meta[name="description"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content') || '',
          url,
          h1: $('h1').first().text().trim(),
          h2Count: $('h2').length,
          h3Count: $('h3').length,
          imageCount: $('img').length,
          linkCount: $('a').length,
          wordCount: this.countWords($.text()),
        };
        logger.info('提取基本页面信息完成');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        url,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`抓取失败 ${url}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        url,
      };
    }
  }

  async sendWebhook(webhookUrl: string, payload: WebhookPayload): Promise<void> {
    try {
      logger.info(`发送Webhook: ${webhookUrl}`);
      await httpClient.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      logger.info('Webhook发送成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Webhook发送失败: ${errorMessage}`);
      throw error;
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isValidSelector(selector: string): boolean {
    try {
      const $ = cheerio.load('<div></div>');
      $(selector);
      return true;
    } catch {
      return false;
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
}

export const scraperService = new ScraperService();

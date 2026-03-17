import cheerio from 'cheerio';
import { httpClient } from '@/utils/httpClient';
import logger from '@/utils/logger';
import { ScrapedData, TaskExecutionResult } from '@/types';

export class ScraperService {
  /**
   * 执行网页数据抓取
   * @param url 目标URL
   * @param selector CSS选择器（可选）
   * @param headers 自定义请求头（可选）
   * @returns 抓取结果
   */
  async scrapeData(
    url: string, 
    selector?: string, 
    headers?: Record<string, string>
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`开始抓取: ${url}`);
      
      // 发起HTTP请求
      const response = await httpClient.getWithRetry(url, {
        headers: headers || {},
      });

      // 解析HTML
      const $ = cheerio.load(response.data);
      let data: ScrapedData[] | Record<string, any>;

      if (selector) {
        // 使用CSS选择器提取特定数据
        data = [];
        $(selector).each((index, element) => {
          const $element = $(element);
          const scrapedItem: ScrapedData = {
            text: $element.text().trim(),
            html: $element.html() || undefined,
            href: $element.attr('href') || undefined,
          };
          
          // 提取其他常用属性
          const attributes = ['src', 'alt', 'title'];
          attributes.forEach(attr => {
            const value = $element.attr(attr);
            if (value) {
              scrapedItem[attr] = value;
            }
          });
          
          data.push(scrapedItem);
        });
        
        logger.info(`使用选择器 "${selector}" 提取到 ${data.length} 个元素`);
      } else {
        // 提取基本页面信息
        data = {
          title: $('title').text().trim(),
          description: $('meta[name="description"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content') || '',
          url: url,
          h1: $('h1').first().text().trim(),
          h2Count: $('h2').length,
          h3Count: $('h3').length,
          imageCount: $('img').length,
          linkCount: $('a').length,
          wordCount: this.countWords($.text()),
        };
        
        logger.info('提取基本页面信息完成');
      }

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        duration,
        url,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error(`抓取失败 ${url}: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        duration,
        url,
      };
    }
  }

  /**
   * 发送数据到Webhook
   * @param webhookUrl Webhook URL
   * @param payload 载荷数据
   */
  async sendWebhook(webhookUrl: string, payload: any): Promise<void> {
    try {
      logger.info(`发送Webhook: ${webhookUrl}`);
      
      await httpClient.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // Webhook超时时间较短
      });
      
      logger.info('Webhook发送成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Webhook发送失败: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 验证URL格式
   * @param url 要验证的URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证CSS选择器（基本验证）
   * @param selector CSS选择器
   */
  isValidSelector(selector: string): boolean {
    try {
      // 使用cheerio来验证选择器语法
      const $ = cheerio.load('<div></div>');
      $(selector);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 统计文本字数
   * @param text 文本内容
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}

export const scraperService = new ScraperService();
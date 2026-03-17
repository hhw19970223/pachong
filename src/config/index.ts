import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // 爬虫配置
  scraper: {
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000', 10),
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    enableConsole: process.env.ENABLE_CONSOLE_LOG !== 'false',
    enableFile: process.env.ENABLE_FILE_LOG !== 'false',
  },

  // 默认Webhook配置
  webhook: {
    defaultUrl: process.env.DEFAULT_WEBHOOK,
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '5000', 10),
    retries: parseInt(process.env.WEBHOOK_RETRIES || '2', 10),
  },

  // 安全配置
  security: {
    enableCors: process.env.ENABLE_CORS !== 'false',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};

export default config;
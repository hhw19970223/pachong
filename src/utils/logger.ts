import winston from 'winston';
import config from '@/config';

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

// 创建Winston logger实例
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [],
});

// 添加控制台输出
if (config.logging.enableConsole) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }));
}

// 添加文件输出
if (config.logging.enableFile) {
  logger.add(new winston.transports.File({
    filename: config.logging.file,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true,
  }));
}

export default logger;
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from '@/config';
import routes from '@/routes';
import { errorHandler } from '@/middleware/errorHandler';
import { taskService } from '@/services/taskService';
import logger from '@/utils/logger';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupGracefulShutdown();
  }

  private setupMiddleware(): void {
    // 安全中间件
    if (config.security.enableHelmet) {
      this.app.use(helmet());
    }

    // CORS配置
    if (config.security.enableCors) {
      this.app.use(cors({
        origin: config.security.corsOrigin,
        credentials: true,
      }));
    }

    // 请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    }));

    // 解析JSON和URL编码数据
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 静态文件服务
    this.app.use(express.static('public'));
  }

  private setupRoutes(): void {
    // 健康检查端点
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    // API路由
    this.app.use('/api', routes);
    this.app.use('/', routes); // 兼容旧版本API

    // 404处理
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `路径 ${req.originalUrl} 不存在`,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupGracefulShutdown(): void {
    // 优雅关闭处理
    const gracefulShutdown = (signal: string) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`);
      
      // 停止接收新请求
      server?.close((err: Error | undefined) => {
        if (err) {
          logger.error('HTTP服务器关闭错误:', err);
          process.exit(1);
        }
        
        logger.info('HTTP服务器已关闭');
        
        // 停止所有cron任务
        taskService.stopAllTasks();
        
        // 销毁所有任务
        taskService.destroyAllTasks();
        
        logger.info('优雅关闭完成');
        process.exit(0);
      });
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常:', error);
      process.exit(1);
    });
    
    // 处理未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的Promise拒绝:', { reason, promise });
      process.exit(1);
    });
  }

  public listen(port: number, host: string = '0.0.0.0'): void {
    global.server = this.app.listen(port, host, () => {
      logger.info(`🚀 Cron Spider 服务已启动`);
      logger.info(`📡 监听地址: http://${host}:${port}`);
      logger.info(`🌍 环境: ${config.server.nodeEnv}`);
      logger.info(`📝 日志级别: ${config.logging.level}`);
    });

    global.server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`端口 ${port} 需要管理员权限`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`端口 ${port} 已被占用`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  }
}

// 声明全局变量
declare global {
  var server: any;
}

export default App;
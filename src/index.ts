import App from '@/app';
import config from '@/config';
import logger from '@/utils/logger';

// 创建应用实例
const app = new App();

// 启动服务器
app.listen(config.server.port, config.server.host);

// 显示启动信息
logger.info('='.repeat(60));
logger.info('🕷️  Cron Spider TypeScript 服务');
logger.info('='.repeat(60));
logger.info(`📦 版本: ${process.env.npm_package_version || '1.0.0'}`);
logger.info(`🔧 Node.js: ${process.version}`);
logger.info(`💻 平台: ${process.platform} ${process.arch}`);
logger.info(`📂 工作目录: ${process.cwd()}`);
logger.info(`⚙️  环境: ${config.server.nodeEnv}`);
logger.info('='.repeat(60));
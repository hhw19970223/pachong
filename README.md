# Cron Spider TypeScript

一个基于 TypeScript 和 Express 的高性能定时爬虫服务，支持动态任务管理、数据抓取和 Webhook 通知。

## ✨ 特性

- 🚀 **TypeScript** - 完整类型安全，提升开发体验
- 🕷️ **智能爬虫** - 支持 CSS 选择器和自动重试机制
- ⏰ **灵活调度** - 基于 Cron 表达式的任务调度
- 📡 **Webhook 通知** - 实时数据推送
- 🛡️ **安全防护** - 内置安全中间件和请求限制
- 📊 **实时监控** - 任务状态和执行统计
- 🔄 **优雅重启** - 零停机时间的服务更新
- 📝 **结构化日志** - Winston 日志系统
- 🐳 **容器化** - Docker 支持

## 🏗️ 项目结构

```
src/
├── controllers/     # 控制器层
├── services/       # 业务逻辑层
├── middleware/     # 中间件
├── routes/         # 路由定义
├── types/          # TypeScript 类型定义
├── utils/          # 工具类
├── config/         # 配置文件
└── index.ts        # 应用入口
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### Skills.sh 动态抓取说明

项目中的 `skills.sh` 首页抓取使用了 `puppeteer`。如果你部署在 Linux 服务器或容器中，单纯 `npm install` 通常还不够，运行时还需要可用的 Chrome/Chromium 以及对应系统库。

推荐做法：

```bash
# Debian / Ubuntu
apt-get update && apt-get install -y chromium
```

然后在环境变量中指定浏览器路径：

```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
PUPPETEER_HEADLESS=true
```

如果你使用 Docker，尽量避免 `alpine` 作为 Puppeteer 运行镜像，优先使用 `node:20-bookworm-slim`、`node:20-bullseye` 这类 Debian 系镜像。

### 配置环境变量

```bash
cp .env.example .env
# 根据需要修改配置
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

## 📡 API 接口

### 服务状态

```http
GET /
GET /health
```

### 任务管理

#### 获取所有任务
```http
GET /tasks
```

#### 创建任务
```http
POST /tasks
Content-Type: application/json

{
  "name": "example-task",
  "schedule": "0 */5 * * * *",
  "url": "https://example.com",
  "selector": ".title",
  "webhook": "https://webhook.site/xxx",
  "startImmediately": false
}
```

#### 任务操作
```http
GET /tasks/:name           # 获取任务状态
POST /tasks/:name/start    # 启动任务
POST /tasks/:name/stop     # 停止任务
POST /tasks/:name/restart  # 重启任务
POST /tasks/:name/execute  # 手动执行任务
DELETE /tasks/:name        # 删除任务
```

## 🕰️ Cron 表达式

支持标准 6 位 Cron 表达式：

```
┌────────────── 秒 (0-59)
│ ┌──────────── 分 (0-59)
│ │ ┌────────── 时 (0-23)
│ │ │ ┌──────── 日 (1-31)
│ │ │ │ ┌────── 月 (1-12)
│ │ │ │ │ ┌──── 星期 (0-6, 0=周日)
│ │ │ │ │ │
* * * * * *
```

### 常用示例

- `0 */5 * * * *` - 每5分钟
- `0 0 * * * *` - 每小时
- `0 0 9 * * *` - 每天上午9点
- `0 0 9 * * 1-5` - 工作日上午9点

## 🎯 使用场景

### 1. 价格监控
```javascript
{
  "name": "price-monitor",
  "schedule": "0 */10 * * * *",
  "url": "https://shop.com/product/123",
  "selector": ".price",
  "webhook": "https://alert-service.com/price-change"
}
```

### 2. 内容抓取
```javascript
{
  "name": "news-scraper",
  "schedule": "0 0 */2 * * *",
  "url": "https://news.com/latest",
  "selector": ".headline",
  "webhook": "https://cms.com/webhook"
}
```

### 3. 健康检查
```javascript
{
  "name": "health-check",
  "schedule": "0 */5 * * * *",
  "url": "https://api.example.com/health",
  "webhook": "https://monitoring.com/alert"
}
```

## 🔧 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `REQUEST_TIMEOUT` | 请求超时时间(ms) | `10000` |
| `MAX_RETRIES` | 最大重试次数 | `3` |

## 📊 监控和日志

- **Winston 日志系统** - 支持文件和控制台输出
- **请求日志** - Morgan 中间件记录所有请求
- **错误追踪** - 完整的错误堆栈和上下文
- **性能指标** - 任务执行时间和成功率统计

## 🛡️ 安全特性

- **Helmet** - 安全头部设置
- **CORS** - 跨域资源共享配置
- **请求验证** - 输入参数验证和清理
- **错误处理** - 安全的错误响应
- **优雅关闭** - 信号处理和资源清理

## 🧪 测试

```bash
# 运行测试（需要配置测试框架）
npm test

# 手动测试 API
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-task",
    "schedule": "0 */1 * * * *",
    "url": "https://httpbin.org/json"
  }'
```

## 📦 Docker 部署

```dockerfile
FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y chromium && rm -rf /var/lib/apt/lists/*
RUN npm ci --only=production
COPY dist ./dist
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t cron-spider-ts .
docker run -p 3001:3001 -e NODE_ENV=production cron-spider-ts
```

## 🤝 贡献指南

1. Fork 这个仓库
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交改动：`git commit -am 'Add new feature'`
4. 推送到分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

如果遇到问题或需要帮助：

1. 查看文档和示例
2. 搜索现有的 Issues
3. 创建新的 Issue 描述问题
4. 联系维护者

---

**⭐ 如果这个项目对你有帮助，请给个星标！**
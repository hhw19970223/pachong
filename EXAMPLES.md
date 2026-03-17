# 使用示例

## 快速开始

### 1. 启动服务
```bash
npm start
```
服务将在端口3001启动。

### 2. 基本使用示例

#### 创建价格监控任务
```bash
# 创建一个每5分钟检查一次的价格监控任务
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "price-monitor-example",
    "schedule": "0 */5 * * * *",
    "url": "https://example-shop.com/api/price/12345",
    "selector": ".price-value",
    "webhook": "https://webhook.site/your-unique-url"
  }'
```

#### 创建网站监控任务
```bash
# 创建一个每小时检查网站是否正常的任务
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "site-health-check",
    "schedule": "0 0 * * * *",
    "url": "https://your-website.com/health",
    "webhook": "https://your-monitoring-service.com/alert"
  }'
```

#### 创建内容抓取任务
```bash
# 创建一个每天抓取新闻的任务
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "news-scraper",
    "schedule": "0 0 9 * * *",
    "url": "https://news-site.com/latest",
    "selector": ".article-title, .article-summary",
    "webhook": "https://your-content-service.com/webhook"
  }'
```

### 3. 任务管理

#### 启动任务
```bash
curl -X POST http://localhost:3001/tasks/price-monitor-example/start
```

#### 停止任务
```bash
curl -X POST http://localhost:3001/tasks/price-monitor-example/stop
```

#### 手动执行任务（用于测试）
```bash
curl -X POST http://localhost:3001/tasks/price-monitor-example/execute \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example-shop.com/product/123",
    "selector": ".current-price"
  }'
```

#### 查看所有任务状态
```bash
curl http://localhost:3001/tasks
```

#### 删除任务
```bash
curl -X DELETE http://localhost:3001/tasks/price-monitor-example
```

## Cron表达式示例

```
# 每分钟
0 * * * * *

# 每5分钟
0 */5 * * * *

# 每小时
0 0 * * * *

# 每天上午9点
0 0 9 * * *

# 每周一上午9点
0 0 9 * * 1

# 每月1号上午9点
0 0 9 1 * *

# 工作日每天上午9点（周一到周五）
0 0 9 * * 1-5
```

## 常用场景

### 1. 电商价格监控
监控竞争对手的产品价格变化：

```javascript
{
  "name": "competitor-price-monitor",
  "schedule": "0 0 */6 * * *", // 每6小时检查一次
  "url": "https://competitor.com/product/12345",
  "selector": ".price",
  "webhook": "https://your-service.com/price-alert"
}
```

### 2. 库存监控
监控产品库存状态：

```javascript
{
  "name": "stock-monitor",
  "schedule": "0 */10 * * * *", // 每10分钟检查一次
  "url": "https://shop.com/api/stock/item123",
  "selector": ".stock-status",
  "webhook": "https://your-service.com/stock-alert"
}
```

### 3. 网站健康监控
定期检查网站是否正常运行：

```javascript
{
  "name": "health-check",
  "schedule": "0 */15 * * * *", // 每15分钟检查一次
  "url": "https://your-website.com/health",
  "webhook": "https://your-monitoring.com/alert"
}
```

### 4. 新闻/内容抓取
定期抓取最新内容：

```javascript
{
  "name": "content-scraper",
  "schedule": "0 0 */2 * * *", // 每2小时抓取一次
  "url": "https://news-site.com/latest",
  "selector": ".headline, .summary",
  "webhook": "https://your-cms.com/webhook"
}
```

### 5. 社交媒体监控
监控品牌提及和关键词：

```javascript
{
  "name": "social-monitor",
  "schedule": "0 */30 * * * *", // 每30分钟检查一次
  "url": "https://social-platform.com/search?q=your-brand",
  "selector": ".post-content",
  "webhook": "https://your-service.com/social-alert"
}
```

## Webhook数据格式

当任务执行完成后，会向指定的webhook发送POST请求，数据格式如下：

```json
{
  "taskName": "price-monitor-example",
  "url": "https://example-shop.com/product/123",
  "data": [
    {
      "text": "￥99.99",
      "html": "<span class=\"price\">￥99.99</span>",
      "href": null
    }
  ],
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## 错误处理

如果任务执行失败，会在服务日志中记录错误信息。常见错误包括：

1. **网络超时** - 目标网站响应时间过长
2. **404错误** - 目标页面不存在
3. **选择器无效** - CSS选择器找不到对应元素
4. **Webhook失败** - 无法发送通知到指定webhook

## 性能建议

1. **合理设置检查频率** - 避免过于频繁的请求
2. **使用精确的CSS选择器** - 提高数据提取效率
3. **监控日志** - 及时发现和处理错误
4. **资源清理** - 定期删除不需要的任务

## 安全注意事项

1. **请求频率限制** - 遵守目标网站的访问规则
2. **用户代理** - 使用合理的User-Agent头部
3. **错误重试** - 避免过于激进的重试策略
4. **数据隐私** - 不要抓取敏感或受保护的内容
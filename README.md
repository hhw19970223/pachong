# Node.js Cron爬虫服务

一个基于Node.js的定时爬虫服务，支持动态创建、管理和执行定时任务。

## 功能特性

- ✅ 动态创建/删除cron任务
- ✅ 网页数据爬取（支持CSS选择器）
- ✅ Webhook通知
- ✅ RESTful API管理
- ✅ 实时任务状态监控
- ✅ 优雅关闭处理

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 根据需要修改 .env 文件
```

### 3. 启动服务
```bash
npm start
# 或开发模式
npm run dev
```

## API接口

### 服务状态
```http
GET /
```

### 任务管理

#### 获取所有任务
```http
GET /tasks
```

#### 创建新任务
```http
POST /tasks
Content-Type: application/json

{
  "name": "example-task",
  "schedule": "0 */30 * * * *",  // 每30分钟执行一次
  "url": "https://example.com",
  "selector": "h1, .title",       // CSS选择器（可选）
  "webhook": "https://webhook.site/xxx"  // webhook地址（可选）
}
```

#### 启动任务
```http
POST /tasks/:name/start
```

#### 停止任务
```http
POST /tasks/:name/stop
```

#### 手动执行任务
```http
POST /tasks/:name/execute
Content-Type: application/json

{
  "url": "https://example.com",
  "selector": ".content",
  "webhook": "https://webhook.site/xxx"
}
```

#### 删除任务
```http
DELETE /tasks/:name
```

## Cron表达式格式

使用标准的6位cron表达式：
```
┌────────────── 秒 (0 - 59)
│ ┌──────────── 分 (0 - 59)
│ │ ┌────────── 时 (0 - 23)
│ │ │ ┌──────── 日 (1 - 31)
│ │ │ │ ┌────── 月 (1 - 12)
│ │ │ │ │ ┌──── 星期 (0 - 6, 0=周日)
│ │ │ │ │ │
* * * * * *
```

### 常用示例：
- `0 */5 * * * *` - 每5分钟
- `0 0 * * * *` - 每小时
- `0 0 9 * * *` - 每天上午9点
- `0 0 0 * * 1` - 每周一午夜

## 使用示例

### 创建价格监控任务
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "price-monitor",
    "schedule": "0 */10 * * * *",
    "url": "https://example-shop.com/product/123",
    "selector": ".price",
    "webhook": "https://your-notification-service.com/webhook"
  }'
```

### 启动任务
```bash
curl -X POST http://localhost:3000/tasks/price-monitor/start
```

### 查看任务状态
```bash
curl http://localhost:3000/tasks
```

## 数据格式

### 有选择器时的输出格式：
```json
[
  {
    "text": "提取的文本内容",
    "html": "<div>HTML内容</div>",
    "href": "链接地址（如果是a标签）"
  }
]
```

### 无选择器时的输出格式：
```json
{
  "title": "页面标题",
  "description": "页面描述",
  "keywords": "关键词",
  "url": "页面URL",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 注意事项

1. **尊重网站robots.txt和访问频率限制**
2. **适当设置请求间隔，避免给目标服务器造成过大压力**
3. **某些网站需要处理反爬虫机制**
4. **生产环境建议配置代理和重试机制**

## 扩展开发

可以根据需求扩展功能：
- 数据库存储
- 邮件通知
- 代理支持
- 反爬虫处理
- 数据去重
- 监控告警
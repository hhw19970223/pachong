const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 存储cron任务的Map
const cronTasks = new Map();

// 日志记录函数
const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

// API路由
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Cron服务已启动',
        activeTasks: cronTasks.size,
        tasks: Array.from(cronTasks.keys())
    });
});

// 获取所有任务状态
app.get('/tasks', (req, res) => {
    const tasks = Array.from(cronTasks.entries()).map(([name, task]) => ({
        name,
        running: task.running || false,
        nextExecutions: task.nextExecutions ? task.nextExecutions(5) : []
    }));
    res.json({ tasks });
});

// 创建新的cron任务
app.post('/tasks', (req, res) => {
    const { name, schedule, url, selector, webhook } = req.body;
    
    if (!name || !schedule) {
        return res.status(400).json({ error: '缺少必要参数: name, schedule' });
    }

    if (cronTasks.has(name)) {
        return res.status(400).json({ error: '任务名已存在' });
    }

    try {
        const task = cron.schedule(schedule, async () => {
            log(`执行任务: ${name}`);
            await executeTask(name, url, selector, webhook);
        }, {
            scheduled: false
        });

        cronTasks.set(name, task);
        log(`创建任务: ${name}, 计划: ${schedule}`);
        
        res.json({ 
            success: true, 
            message: `任务 ${name} 创建成功`,
            task: { name, schedule, url, selector, webhook }
        });
    } catch (error) {
        res.status(400).json({ error: `无效的cron表达式: ${error.message}` });
    }
});

// 启动任务
app.post('/tasks/:name/start', (req, res) => {
    const { name } = req.params;
    const task = cronTasks.get(name);
    
    if (!task) {
        return res.status(404).json({ error: '任务不存在' });
    }

    task.start();
    log(`启动任务: ${name}`);
    res.json({ success: true, message: `任务 ${name} 已启动` });
});

// 停止任务
app.post('/tasks/:name/stop', (req, res) => {
    const { name } = req.params;
    const task = cronTasks.get(name);
    
    if (!task) {
        return res.status(404).json({ error: '任务不存在' });
    }

    task.stop();
    log(`停止任务: ${name}`);
    res.json({ success: true, message: `任务 ${name} 已停止` });
});

// 删除任务
app.delete('/tasks/:name', (req, res) => {
    const { name } = req.params;
    const task = cronTasks.get(name);
    
    if (!task) {
        return res.status(404).json({ error: '任务不存在' });
    }

    task.stop();
    task.destroy();
    cronTasks.delete(name);
    
    log(`删除任务: ${name}`);
    res.json({ success: true, message: `任务 ${name} 已删除` });
});

// 执行具体任务的函数
async function executeTask(taskName, url, selector, webhook) {
    try {
        if (!url) {
            log(`任务 ${taskName}: 无URL配置，跳过执行`);
            return;
        }

        // 爬取网页数据
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        let data;

        if (selector) {
            // 使用CSS选择器提取特定数据
            data = [];
            $(selector).each((index, element) => {
                data.push({
                    text: $(element).text().trim(),
                    html: $(element).html(),
                    href: $(element).attr('href')
                });
            });
        } else {
            // 提取基本页面信息
            data = {
                title: $('title').text(),
                description: $('meta[name="description"]').attr('content'),
                keywords: $('meta[name="keywords"]').attr('content'),
                url: url,
                timestamp: new Date().toISOString()
            };
        }

        log(`任务 ${taskName}: 数据采集成功，获取到 ${Array.isArray(data) ? data.length : 1} 条记录`);

        // 发送到webhook（如果配置了）
        if (webhook) {
            await axios.post(webhook, {
                taskName,
                url,
                data,
                timestamp: new Date().toISOString()
            });
            log(`任务 ${taskName}: 数据已发送到webhook`);
        }

        return data;
    } catch (error) {
        log(`任务 ${taskName} 执行失败: ${error.message}`);
        throw error;
    }
}

// 手动执行任务
app.post('/tasks/:name/execute', async (req, res) => {
    const { name } = req.params;
    
    if (!cronTasks.has(name)) {
        return res.status(404).json({ error: '任务不存在' });
    }

    try {
        const { url, selector, webhook } = req.body;
        const result = await executeTask(name, url, selector, webhook);
        res.json({ 
            success: true, 
            message: `任务 ${name} 手动执行成功`,
            data: result
        });
    } catch (error) {
        res.status(500).json({ 
            error: `任务执行失败: ${error.message}` 
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    log(`Cron服务已启动，端口: ${PORT}`);
    log('API接口:');
    log('  GET  /           - 服务状态');
    log('  GET  /tasks      - 获取所有任务');
    log('  POST /tasks      - 创建新任务');
    log('  POST /tasks/:name/start    - 启动任务');
    log('  POST /tasks/:name/stop     - 停止任务');
    log('  POST /tasks/:name/execute  - 手动执行任务');
    log('  DELETE /tasks/:name        - 删除任务');
});

// 优雅关闭
process.on('SIGTERM', () => {
    log('收到SIGTERM信号，正在关闭服务...');
    
    // 停止所有cron任务
    cronTasks.forEach((task, name) => {
        task.stop();
        task.destroy();
        log(`停止任务: ${name}`);
    });
    
    process.exit(0);
});
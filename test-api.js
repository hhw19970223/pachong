const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
    console.log('🧪 开始测试Cron服务API...\n');

    try {
        // 1. 检查服务状态
        console.log('1. 检查服务状态...');
        const status = await axios.get(`${BASE_URL}/`);
        console.log('✅ 服务状态:', status.data);
        console.log();

        // 2. 创建测试任务
        console.log('2. 创建测试任务...');
        const taskData = {
            name: 'test-task',
            schedule: '*/10 * * * * *', // 每10秒执行一次
            url: 'https://httpbin.org/json',
            webhook: '' // 可以设置webhook测试地址
        };

        const createTask = await axios.post(`${BASE_URL}/tasks`, taskData);
        console.log('✅ 任务创建结果:', createTask.data);
        console.log();

        // 3. 查看所有任务
        console.log('3. 查看所有任务...');
        const tasks = await axios.get(`${BASE_URL}/tasks`);
        console.log('✅ 当前任务列表:', tasks.data);
        console.log();

        // 4. 手动执行任务
        console.log('4. 手动执行任务...');
        const executeResult = await axios.post(`${BASE_URL}/tasks/test-task/execute`, {
            url: 'https://httpbin.org/json',
            selector: '' // 不使用选择器，获取基本页面信息
        });
        console.log('✅ 手动执行结果:', executeResult.data);
        console.log();

        // 5. 启动任务
        console.log('5. 启动定时任务...');
        const startResult = await axios.post(`${BASE_URL}/tasks/test-task/start`);
        console.log('✅ 启动结果:', startResult.data);
        console.log();

        // 等待一段时间观察定时执行
        console.log('⏰ 等待20秒观察定时执行...');
        await new Promise(resolve => setTimeout(resolve, 20000));

        // 6. 停止任务
        console.log('6. 停止任务...');
        const stopResult = await axios.post(`${BASE_URL}/tasks/test-task/stop`);
        console.log('✅ 停止结果:', stopResult.data);
        console.log();

        // 7. 删除任务
        console.log('7. 删除任务...');
        const deleteResult = await axios.delete(`${BASE_URL}/tasks/test-task`);
        console.log('✅ 删除结果:', deleteResult.data);
        console.log();

        console.log('🎉 所有测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
    }
}

// 检查服务是否启动
async function checkService() {
    try {
        await axios.get(`${BASE_URL}/`);
        return true;
    } catch (error) {
        return false;
    }
}

async function main() {
    const isRunning = await checkService();
    
    if (!isRunning) {
        console.log('❌ 服务未启动，请先运行: npm start');
        console.log('然后在另一个终端运行: node test-api.js');
        return;
    }

    await testAPI();
}

main();
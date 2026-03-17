import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

class ApiTester {
  private client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    validateStatus: () => true, // 接受所有状态码
  });

  async testServiceStatus(): Promise<void> {
    console.log('🧪 1. 测试服务状态...');
    const response: AxiosResponse<ApiResponse> = await this.client.get('/');
    this.logResponse('服务状态', response);
  }

  async testCreateTask(): Promise<void> {
    console.log('🧪 2. 测试创建任务...');
    const taskData = {
      name: 'test-task-ts',
      schedule: '*/10 * * * * *', // 每10秒执行一次
      url: 'https://httpbin.org/json',
      webhook: '',
    };

    const response: AxiosResponse<ApiResponse> = await this.client.post('/tasks', taskData);
    this.logResponse('创建任务', response);
  }

  async testGetAllTasks(): Promise<void> {
    console.log('🧪 3. 测试获取所有任务...');
    const response: AxiosResponse<ApiResponse> = await this.client.get('/tasks');
    this.logResponse('获取所有任务', response);
  }

  async testExecuteTask(): Promise<void> {
    console.log('🧪 4. 测试手动执行任务...');
    const executeData = {
      url: 'https://httpbin.org/json',
      selector: '',
    };

    const response: AxiosResponse<ApiResponse> = await this.client.post('/tasks/test-task-ts/execute', executeData);
    this.logResponse('手动执行任务', response);
  }

  async testStartTask(): Promise<void> {
    console.log('🧪 5. 测试启动任务...');
    const response: AxiosResponse<ApiResponse> = await this.client.post('/tasks/test-task-ts/start');
    this.logResponse('启动任务', response);
  }

  async testGetTask(): Promise<void> {
    console.log('🧪 6. 测试获取单个任务状态...');
    const response: AxiosResponse<ApiResponse> = await this.client.get('/tasks/test-task-ts');
    this.logResponse('获取任务状态', response);
  }

  async testStopTask(): Promise<void> {
    console.log('🧪 7. 测试停止任务...');
    const response: AxiosResponse<ApiResponse> = await this.client.post('/tasks/test-task-ts/stop');
    this.logResponse('停止任务', response);
  }

  async testDeleteTask(): Promise<void> {
    console.log('🧪 8. 测试删除任务...');
    const response: AxiosResponse<ApiResponse> = await this.client.delete('/tasks/test-task-ts');
    this.logResponse('删除任务', response);
  }

  async testErrorHandling(): Promise<void> {
    console.log('🧪 9. 测试错误处理...');
    
    // 测试无效的任务名称
    const invalidTaskData = {
      name: '', // 无效名称
      schedule: '* * * * * *',
      url: 'https://httpbin.org/json',
    };

    const response: AxiosResponse<ApiResponse> = await this.client.post('/tasks', invalidTaskData);
    this.logResponse('无效任务创建', response);
  }

  private logResponse(operation: string, response: AxiosResponse<ApiResponse>): void {
    const status = response.status >= 200 && response.status < 300 ? '✅' : '❌';
    console.log(`${status} ${operation}:`);
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应: ${JSON.stringify(response.data, null, 2)}`);
    console.log();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 开始测试 Cron Spider TypeScript API...\n');

    try {
      await this.testServiceStatus();
      await this.delay(1000);

      await this.testCreateTask();
      await this.delay(1000);

      await this.testGetAllTasks();
      await this.delay(1000);

      await this.testExecuteTask();
      await this.delay(1000);

      await this.testGetTask();
      await this.delay(1000);

      await this.testStartTask();
      await this.delay(1000);

      await this.testGetTask();
      await this.delay(15000); // 等待定时任务执行

      await this.testStopTask();
      await this.delay(1000);

      await this.testDeleteTask();
      await this.delay(1000);

      await this.testErrorHandling();

      console.log('🎉 所有测试完成！');
    } catch (error) {
      console.error('❌ 测试失败:', error);
    }
  }
}

// 检查服务是否启动
async function checkService(): Promise<boolean> {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const isRunning = await checkService();
  
  if (!isRunning) {
    console.log('❌ 服务未启动，请先运行: npm run dev');
    console.log('然后在另一个终端运行: npx ts-node scripts/test-api.ts');
    return;
  }

  const tester = new ApiTester();
  await tester.runAllTests();
}

main().catch(console.error);
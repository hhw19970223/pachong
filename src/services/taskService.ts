import * as cron from 'node-cron';
import { 
  TaskConfig, 
  CronTaskInstance, 
  TaskStatus, 
  TaskExecutionResult,
  WebhookPayload,
  ExecuteTaskOptions 
} from '@/types';
import { scraperService } from './scraperService';
import logger from '@/utils/logger';
import config from '@/config';

export class TaskService {
  private tasks: Map<string, CronTaskInstance> = new Map();

  /**
   * 创建新任务
   * @param taskConfig 任务配置
   */
  createTask(taskConfig: TaskConfig): void {
    if (this.tasks.has(taskConfig.name)) {
      throw new Error(`任务 "${taskConfig.name}" 已存在`);
    }

    // 验证cron表达式
    if (!cron.validate(taskConfig.schedule)) {
      throw new Error(`无效的cron表达式: ${taskConfig.schedule}`);
    }

    // 验证URL（如果提供）
    if (taskConfig.url && !scraperService.isValidUrl(taskConfig.url)) {
      throw new Error(`无效的URL: ${taskConfig.url}`);
    }

    // 验证选择器（如果提供）
    if (taskConfig.selector && !scraperService.isValidSelector(taskConfig.selector)) {
      throw new Error(`无效的CSS选择器: ${taskConfig.selector}`);
    }

    // 创建cron任务
    const task = cron.schedule(taskConfig.schedule, async () => {
      await this.executeTask(taskConfig.name, {
        url: taskConfig.url,
        selector: taskConfig.selector,
        webhook: taskConfig.webhook,
        headers: taskConfig.headers,
      });
    }, {
      scheduled: false,
    } as any); // 创建后不立即启动

    // 存储任务实例
    const cronTaskInstance: CronTaskInstance = {
      config: taskConfig,
      task,
      status: {
        running: false,
        created: new Date(),
        executionCount: 0,
        failureCount: 0,
      },
    };

    this.tasks.set(taskConfig.name, cronTaskInstance);
    logger.info(`任务创建成功: ${taskConfig.name}, 调度: ${taskConfig.schedule}`);
  }

  /**
   * 启动任务
   * @param taskName 任务名称
   */
  startTask(taskName: string): void {
    const taskInstance = this.getTaskInstance(taskName);
    
    if (taskInstance.status.running) {
      throw new Error(`任务 "${taskName}" 已经在运行中`);
    }

    taskInstance.task.start();
    taskInstance.status.running = true;
    
    logger.info(`任务启动成功: ${taskName}`);
  }

  /**
   * 停止任务
   * @param taskName 任务名称
   */
  stopTask(taskName: string): void {
    const taskInstance = this.getTaskInstance(taskName);
    
    if (!taskInstance.status.running) {
      throw new Error(`任务 "${taskName}" 未运行`);
    }

    taskInstance.task.stop();
    taskInstance.status.running = false;
    
    logger.info(`任务停止成功: ${taskName}`);
  }

  /**
   * 删除任务
   * @param taskName 任务名称
   */
  deleteTask(taskName: string): void {
    const taskInstance = this.getTaskInstance(taskName);
    
    // 停止任务（如果正在运行）
    if (taskInstance.status.running) {
      taskInstance.task.stop();
    }

    // 销毁任务
    taskInstance.task.destroy();
    
    // 从Map中删除
    this.tasks.delete(taskName);
    
    logger.info(`任务删除成功: ${taskName}`);
  }

  /**
   * 手动执行任务
   * @param taskName 任务名称
   * @param options 执行选项
   */
  async executeTask(taskName: string, options?: ExecuteTaskOptions): Promise<TaskExecutionResult> {
    const taskInstance = this.getTaskInstance(taskName);
    const startTime = Date.now();

    try {
      logger.info(`开始执行任务: ${taskName}`);

      // 合并配置和选项
      const url = options?.url || taskInstance.config.url;
      const selector = options?.selector || taskInstance.config.selector;
      const webhook = options?.webhook || taskInstance.config.webhook;
      const headers = { ...taskInstance.config.headers, ...options?.headers };

      if (!url) {
        throw new Error('URL未配置');
      }

      // 执行抓取
      const result = await scraperService.scrapeData(url, selector, headers);

      // 更新执行统计
      taskInstance.status.lastExecuted = new Date();
      taskInstance.status.executionCount++;

      if (result.success) {
        taskInstance.status.lastError = undefined;
        logger.info(`任务执行成功: ${taskName}, 耗时: ${Date.now() - startTime}ms`);
      } else {
        taskInstance.status.failureCount++;
        taskInstance.status.lastError = result.error;
        logger.error(`任务执行失败: ${taskName}, 错误: ${result.error}`);
      }

      // 发送Webhook（如果配置了）
      if (webhook && result.success) {
        try {
          const payload: WebhookPayload = {
            taskName,
            url,
            result,
            timestamp: new Date().toISOString(),
          };
          
          await scraperService.sendWebhook(webhook, payload);
        } catch (webhookError) {
          logger.error(`Webhook发送失败 (${taskName}):`, webhookError);
          // Webhook失败不影响任务执行结果
        }
      }

      return result;
    } catch (error) {
      taskInstance.status.failureCount++;
      taskInstance.status.lastError = error instanceof Error ? error.message : String(error);
      
      const errorResult: TaskExecutionResult = {
        success: false,
        error: taskInstance.status.lastError,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };

      logger.error(`任务执行异常: ${taskName}`, error);
      return errorResult;
    }
  }

  /**
   * 获取任务状态
   * @param taskName 任务名称
   */
  getTaskStatus(taskName: string): TaskStatus {
    const taskInstance = this.getTaskInstance(taskName);

    return {
      name: taskName,
      running: taskInstance.status.running,
      created: taskInstance.status.created.toISOString(),
      lastExecuted: taskInstance.status.lastExecuted?.toISOString(),
      nextExecution: this.getNextExecution(taskInstance.config.schedule),
      executionCount: taskInstance.status.executionCount,
      failureCount: taskInstance.status.failureCount,
      lastError: taskInstance.status.lastError,
      config: taskInstance.config,
    };
  }

  /**
   * 获取所有任务状态
   */
  getAllTasksStatus(): TaskStatus[] {
    return Array.from(this.tasks.keys()).map(taskName => this.getTaskStatus(taskName));
  }

  /**
   * 检查任务是否存在
   * @param taskName 任务名称
   */
  hasTask(taskName: string): boolean {
    return this.tasks.has(taskName);
  }

  /**
   * 获取任务数量统计
   */
  getTaskStats() {
    const totalTasks = this.tasks.size;
    const runningTasks = Array.from(this.tasks.values()).filter(task => task.status.running).length;
    
    return {
      total: totalTasks,
      running: runningTasks,
      stopped: totalTasks - runningTasks,
    };
  }

  /**
   * 停止所有任务（用于优雅关闭）
   */
  stopAllTasks(): void {
    logger.info('停止所有任务...');
    
    for (const [taskName, taskInstance] of this.tasks) {
      if (taskInstance.status.running) {
        taskInstance.task.stop();
        taskInstance.status.running = false;
        logger.info(`任务已停止: ${taskName}`);
      }
    }
  }

  /**
   * 销毁所有任务（用于优雅关闭）
   */
  destroyAllTasks(): void {
    logger.info('销毁所有任务...');
    
    for (const [taskName, taskInstance] of this.tasks) {
      taskInstance.task.destroy();
      logger.info(`任务已销毁: ${taskName}`);
    }
    
    this.tasks.clear();
  }

  /**
   * 获取任务实例（内部使用）
   * @param taskName 任务名称
   */
  private getTaskInstance(taskName: string): CronTaskInstance {
    const taskInstance = this.tasks.get(taskName);
    if (!taskInstance) {
      throw new Error(`任务 "${taskName}" 不存在`);
    }
    return taskInstance;
  }

  /**
   * 计算下次执行时间
   * @param schedule cron表达式
   */
  private getNextExecution(schedule: string): string | undefined {
    try {
      // 这是一个简化实现，实际可能需要更复杂的cron解析库
      const task = cron.schedule(schedule, () => {}, { scheduled: false } as any);
      // node-cron可能不直接提供下次执行时间，这里返回undefined
      task.destroy();
      return undefined;
    } catch {
      return undefined;
    }
  }
}

export const taskService = new TaskService();
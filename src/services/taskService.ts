import * as cron from 'node-cron';
import {
  CronTaskInstance,
  ExecuteTaskOptions,
  TaskConfig,
  TaskExecutionResult,
  TaskStatus,
  WebhookPayload,
} from '@/types';
import { scraperService } from './scraperService';
import logger from '@/utils/logger';

export class TaskService {
  private tasks: Map<string, CronTaskInstance> = new Map();

  createTask(taskConfig: TaskConfig): void {
    if (this.tasks.has(taskConfig.name)) {
      throw new Error(`任务 "${taskConfig.name}" 已存在`);
    }

    if (!cron.validate(taskConfig.schedule)) {
      throw new Error(`无效的cron表达式: ${taskConfig.schedule}`);
    }

    if (taskConfig.url && !scraperService.isValidUrl(taskConfig.url)) {
      throw new Error(`无效的URL: ${taskConfig.url}`);
    }

    if (taskConfig.selector && !scraperService.isValidSelector(taskConfig.selector)) {
      throw new Error(`无效的CSS选择器: ${taskConfig.selector}`);
    }

    const task = cron.schedule(taskConfig.schedule, async () => {
      await this.executeTask(taskConfig.name, {
        url: taskConfig.url,
        selector: taskConfig.selector,
        webhook: taskConfig.webhook,
        headers: taskConfig.headers,
      });
    }, {
      scheduled: false,
    } as never);

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

  startTask(taskName: string): void {
    const taskInstance = this.getTaskInstance(taskName);

    if (taskInstance.status.running) {
      throw new Error(`任务 "${taskName}" 已经在运行中`);
    }

    taskInstance.task.start();
    taskInstance.status.running = true;

    logger.info(`任务启动成功: ${taskName}`);
  }

  stopTask(taskName: string): void {
    const taskInstance = this.getTaskInstance(taskName);

    if (!taskInstance.status.running) {
      throw new Error(`任务 "${taskName}" 未运行`);
    }

    taskInstance.task.stop();
    taskInstance.status.running = false;

    logger.info(`任务停止成功: ${taskName}`);
  }

  deleteTask(taskName: string): void {
    const taskInstance = this.getTaskInstance(taskName);

    if (taskInstance.status.running) {
      taskInstance.task.stop();
    }

    taskInstance.task.destroy();
    this.tasks.delete(taskName);

    logger.info(`任务删除成功: ${taskName}`);
  }

  async executeTask(taskName: string, options?: ExecuteTaskOptions): Promise<TaskExecutionResult> {
    const taskInstance = this.getTaskInstance(taskName);
    const startTime = Date.now();

    try {
      logger.info(`开始执行任务: ${taskName}`);

      const url = options?.url || taskInstance.config.url;
      const selector = options?.selector || taskInstance.config.selector;
      const webhook = options?.webhook || taskInstance.config.webhook;
      const headers = { ...taskInstance.config.headers, ...options?.headers };

      if (!url) {
        throw new Error('URL未配置');
      }

      const result = await scraperService.scrapeData(url, selector, headers);

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

  getAllTasksStatus(): TaskStatus[] {
    return Array.from(this.tasks.keys()).map((taskName) => this.getTaskStatus(taskName));
  }

  hasTask(taskName: string): boolean {
    return this.tasks.has(taskName);
  }

  getTaskStats(): { total: number; running: number; stopped: number } {
    const totalTasks = this.tasks.size;
    const runningTasks = Array.from(this.tasks.values()).filter((task) => task.status.running).length;

    return {
      total: totalTasks,
      running: runningTasks,
      stopped: totalTasks - runningTasks,
    };
  }

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

  destroyAllTasks(): void {
    logger.info('销毁所有任务...');

    for (const [taskName, taskInstance] of this.tasks) {
      taskInstance.task.destroy();
      logger.info(`任务已销毁: ${taskName}`);
    }

    this.tasks.clear();
  }

  private getTaskInstance(taskName: string): CronTaskInstance {
    const taskInstance = this.tasks.get(taskName);
    if (!taskInstance) {
      throw new Error(`任务 "${taskName}" 不存在`);
    }

    return taskInstance;
  }

  private getNextExecution(schedule: string): string | undefined {
    try {
      const task = cron.schedule(schedule, () => {}, { scheduled: false } as never);
      task.destroy();
      return undefined;
    } catch {
      return undefined;
    }
  }
}

export const taskService = new TaskService();

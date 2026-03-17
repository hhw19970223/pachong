import { Request, Response } from 'express';
import { taskService } from '@/services/taskService';
import { 
  CreateTaskRequest, 
  ExecuteTaskOptions, 
  ApiResponse, 
  ServiceStatus,
  TaskStatus 
} from '@/types';
import logger from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';

export class TaskController {
  /**
   * 获取服务状态
   */
  getServiceStatus = asyncHandler(async (req: Request, res: Response<ApiResponse<ServiceStatus>>) => {
    const stats = taskService.getTaskStats();
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
    
    const status: ServiceStatus = {
      status: 'running',
      message: 'Cron服务运行正常',
      activeTasks: stats.running,
      totalTasks: stats.total,
      uptime: uptimeString,
      version: process.env.npm_package_version || '1.0.0',
      tasks: taskService.getAllTasksStatus().map(task => task.name),
    };

    res.json({
      success: true,
      message: '服务状态获取成功',
      data: status,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 获取所有任务状态
   */
  getAllTasks = asyncHandler(async (req: Request, res: Response<ApiResponse<{ tasks: TaskStatus[] }>>) => {
    const tasks = taskService.getAllTasksStatus();
    
    res.json({
      success: true,
      message: '任务列表获取成功',
      data: { tasks },
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 创建新任务
   */
  createTask = asyncHandler(async (req: Request<{}, {}, CreateTaskRequest>, res: Response<ApiResponse>) => {
    const taskConfig = req.body;
    
    taskService.createTask(taskConfig);
    
    // 如果请求立即启动任务
    if (taskConfig.startImmediately) {
      taskService.startTask(taskConfig.name);
    }

    logger.info(`任务创建${taskConfig.startImmediately ? '并启动' : ''}成功: ${taskConfig.name}`);

    res.status(201).json({
      success: true,
      message: `任务 ${taskConfig.name} 创建${taskConfig.startImmediately ? '并启动' : ''}成功`,
      data: { 
        task: taskService.getTaskStatus(taskConfig.name) 
      },
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 获取单个任务状态
   */
  getTask = asyncHandler(async (req: Request<{ name: string }>, res: Response<ApiResponse<TaskStatus>>) => {
    const { name } = req.params;
    const taskStatus = taskService.getTaskStatus(name);
    
    res.json({
      success: true,
      message: '任务状态获取成功',
      data: taskStatus,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 启动任务
   */
  startTask = asyncHandler(async (req: Request<{ name: string }>, res: Response<ApiResponse>) => {
    const { name } = req.params;
    
    taskService.startTask(name);
    
    res.json({
      success: true,
      message: `任务 ${name} 启动成功`,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 停止任务
   */
  stopTask = asyncHandler(async (req: Request<{ name: string }>, res: Response<ApiResponse>) => {
    const { name } = req.params;
    
    taskService.stopTask(name);
    
    res.json({
      success: true,
      message: `任务 ${name} 停止成功`,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 删除任务
   */
  deleteTask = asyncHandler(async (req: Request<{ name: string }>, res: Response<ApiResponse>) => {
    const { name } = req.params;
    
    taskService.deleteTask(name);
    
    res.json({
      success: true,
      message: `任务 ${name} 删除成功`,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 手动执行任务
   */
  executeTask = asyncHandler(async (req: Request<{ name: string }, {}, ExecuteTaskOptions>, res: Response<ApiResponse>) => {
    const { name } = req.params;
    const options = req.body;
    
    const result = await taskService.executeTask(name, options);
    
    res.json({
      success: result.success,
      message: result.success ? `任务 ${name} 执行成功` : `任务 ${name} 执行失败`,
      data: result,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 重新启动任务
   */
  restartTask = asyncHandler(async (req: Request<{ name: string }>, res: Response<ApiResponse>) => {
    const { name } = req.params;
    
    // 先停止再启动
    if (taskService.getTaskStatus(name).running) {
      taskService.stopTask(name);
    }
    taskService.startTask(name);
    
    res.json({
      success: true,
      message: `任务 ${name} 重启成功`,
      timestamp: new Date().toISOString(),
    });
  });
}

export const taskController = new TaskController();
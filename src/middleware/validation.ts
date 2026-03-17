import { Request, Response, NextFunction } from 'express';
import * as cron from 'node-cron';
import { CreateTaskRequest } from '@/types';

export const validateCreateTask = (
  req: Request<{}, {}, CreateTaskRequest>, 
  res: Response, 
  next: NextFunction
): void => {
  const { name, schedule, url, selector } = req.body;

  // 验证必填字段
  if (!name || !schedule) {
    res.status(400).json({
      success: false,
      message: '缺少必要参数: name, schedule',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 验证任务名称格式
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    res.status(400).json({
      success: false,
      message: '任务名称只能包含字母、数字、下划线和连字符',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 验证cron表达式
  if (!cron.validate(schedule)) {
    res.status(400).json({
      success: false,
      message: `无效的cron表达式: ${schedule}`,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 验证URL格式（如果提供）
  if (url) {
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        message: `无效的URL格式: ${url}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // 验证选择器格式（基础验证）
  if (selector && selector.length > 500) {
    res.status(400).json({
      success: false,
      message: 'CSS选择器过长（最大500字符）',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

export const validateTaskName = (
  req: Request<{ name: string }>, 
  res: Response, 
  next: NextFunction
): void => {
  const { name } = req.params;

  if (!name) {
    res.status(400).json({
      success: false,
      message: '缺少任务名称参数',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    res.status(400).json({
      success: false,
      message: '无效的任务名称格式',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};
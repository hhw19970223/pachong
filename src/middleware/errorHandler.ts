import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { ApiResponse } from '@/types';

export const errorHandler = (
  error: Error, 
  req: Request, 
  res: Response<ApiResponse>, 
  next: NextFunction
): void => {
  logger.error(`错误处理: ${error.message}`, {
    url: req.url,
    method: req.method,
    stack: error.stack,
  });

  // 默认错误响应
  let statusCode = 500;
  let message = '服务器内部错误';

  // 根据错误类型设置相应的状态码和消息
  if (error.message.includes('不存在')) {
    statusCode = 404;
    message = error.message;
  } else if (error.message.includes('已存在')) {
    statusCode = 409;
    message = error.message;
  } else if (error.message.includes('无效') || error.message.includes('缺少')) {
    statusCode = 400;
    message = error.message;
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: error.message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
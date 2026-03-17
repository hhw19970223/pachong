import { ScheduledTask } from 'node-cron';

// 基础任务配置接口
export interface TaskConfig {
  name: string;
  schedule: string;
  url?: string;
  selector?: string;
  webhook?: string;
  headers?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// 任务创建请求接口
export interface CreateTaskRequest extends TaskConfig {
  startImmediately?: boolean;
}

// 任务状态接口
export interface TaskStatus {
  name: string;
  running: boolean;
  created: string;
  lastExecuted?: string;
  nextExecution?: string;
  executionCount: number;
  failureCount: number;
  lastError?: string;
  config: TaskConfig;
}

// 内部任务对象接口
export interface CronTaskInstance {
  config: TaskConfig;
  task: ScheduledTask;
  status: {
    running: boolean;
    created: Date;
    lastExecuted?: Date;
    executionCount: number;
    failureCount: number;
    lastError?: string;
  };
}

// 爬取结果接口
export interface ScrapedData {
  text: string;
  html?: string;
  href?: string;
  [key: string]: any;
}

// 任务执行结果接口
export interface TaskExecutionResult {
  success: boolean;
  data?: ScrapedData[] | Record<string, any>;
  error?: string;
  timestamp: string;
  duration: number;
  url?: string;
}

// Webhook载荷接口
export interface WebhookPayload {
  taskName: string;
  url?: string;
  result: TaskExecutionResult;
  timestamp: string;
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 任务执行选项
export interface ExecuteTaskOptions {
  url?: string;
  selector?: string;
  webhook?: string;
  headers?: Record<string, string>;
}

// 服务状态接口
export interface ServiceStatus {
  status: 'running' | 'stopped';
  message: string;
  activeTasks: number;
  totalTasks: number;
  uptime: string;
  version: string;
  tasks: string[];
}

// 错误类型
export interface TaskError {
  name: string;
  message: string;
  code?: string;
  timestamp: Date;
  taskName?: string;
}

export type SkillDirectorySource = 'skills.sh' | 'clawhub.ai';

export interface SkillAuditStatus {
  name: string;
  status: string;
  url?: string;
}

export interface SkillInstallationMetric {
  platform: string;
  installs: number;
  installsText?: string;
}

export interface SkillModerationInfo {
  verdict?: string;
  summary?: string | null;
  reasonCodes?: string[];
  updatedAt?: string;
  isSuspicious?: boolean;
  isMalwareBlocked?: boolean;
}

export interface DirectorySkillStats {
  downloads?: number;
  downloadsText?: string;
  installsWeekly?: number;
  installsWeeklyText?: string;
  installsCurrent?: number;
  installsAllTime?: number;
  stars?: number;
  versions?: number;
  comments?: number;
}

export interface DirectorySkillContent {
  markdown?: string;
  html?: string;
  rawText?: string;
}

export interface DirectorySkillEntry {
  source: SkillDirectorySource;
  rank: number;
  slug: string;
  name: string;
  owner?: string;
  repository?: string;
  summary?: string;
  detailUrl: string;
  installCommand?: string;
  firstSeen?: string;
  createdAt?: string;
  updatedAt?: string;
  latestVersion?: string;
  latestVersionCreatedAt?: string;
  changelog?: string;
  tags?: string[];
  stats: DirectorySkillStats;
  suspicious?: boolean;
  moderation?: SkillModerationInfo;
  audits?: SkillAuditStatus[];
  installedOn?: SkillInstallationMetric[];
  skillFile?: DirectorySkillContent;
  raw?: Record<string, unknown>;
}

export interface SkillsLeaderboard {
  source: SkillDirectorySource;
  skills: DirectorySkillEntry[];
  totalCount: number;
  scrapedAt: string;
  nextCursor?: string | null;
}

export interface MultiSourceSkillsLeaderboard {
  sources: SkillsLeaderboard[];
  combined: DirectorySkillEntry[];
  totalCount: number;
  scrapedAt: string;
}
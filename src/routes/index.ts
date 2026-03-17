import { Router } from 'express';
import { taskController } from '@/controllers/taskController';
import { skillsController } from '@/controllers/skillsController';
import { validateCreateTask, validateTaskName } from '@/middleware/validation';

const router = Router();

// 服务状态
router.get('/', taskController.getServiceStatus);

// 任务管理路由
router.get('/tasks', taskController.getAllTasks);
router.post('/tasks', validateCreateTask, taskController.createTask);

// 单个任务操作
router.get('/tasks/:name', validateTaskName, taskController.getTask);
router.post('/tasks/:name/start', validateTaskName, taskController.startTask);
router.post('/tasks/:name/stop', validateTaskName, taskController.stopTask);
router.post('/tasks/:name/restart', validateTaskName, taskController.restartTask);
router.post('/tasks/:name/execute', validateTaskName, taskController.executeTask);
router.delete('/tasks/:name', validateTaskName, taskController.deleteTask);

// Skills 爬虫路由
router.get('/skills', skillsController.getUsageInfo);
router.get('/skills/popular', skillsController.scrapePopularSkills);
router.get('/skills/categories', skillsController.getSkillCategories);
router.get('/skills/category/:category', skillsController.scrapeSkillsByCategory);
router.get('/skills/scrape', skillsController.scrapeTopSkills);
router.post('/skills/scrape-repos', skillsController.scrapeSkillsFromRepos);

// 爬取数据查看API
router.get('/skills/data', skillsController.getScrapedData);
router.get('/skills/data/summary', skillsController.getDataSummary);
router.get('/skills/data/category/:category', skillsController.getDataByCategory);
router.get('/skills/data/search', skillsController.searchSkills);

export default router;
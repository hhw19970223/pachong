import { Router } from 'express';
import { skillsController } from '@/controllers/skillsController';

const router: Router = Router();

router.get('/', skillsController.getUsageInfo);
router.get('/skills', skillsController.getUsageInfo);
router.get('/skills/scrape', skillsController.scrapeTopSkills);
router.get('/skills/cache', skillsController.getCachedSkills);

export default router;
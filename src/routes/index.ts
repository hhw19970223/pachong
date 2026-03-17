import { Router } from 'express';
import { skillsController } from '@/controllers/skillsController';

const router: Router = Router();

router.get('/', skillsController.getUsageInfo);
router.get('/skills', skillsController.getUsageInfo);
router.get('/skills/scrape', skillsController.scrapeTopSkills);

export default router;
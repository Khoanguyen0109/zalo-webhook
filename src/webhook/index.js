import { Router } from 'express';
import { webhook } from './controller';

const router = Router();


router.post('/webhook' , webhook)
router.get('/webhook' , webhook)

export default router
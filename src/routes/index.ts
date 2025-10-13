import { Router } from 'express';
import authController from '../modules/auth/controller';

const router = Router();

router.use('/auth', authController.router);

export default router;


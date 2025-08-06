import express from 'express';
import { register, login, refreshToken } from '../controllers/authController.js';
import { authenticate, isVerifiedPass } from '../middlewares/auth.js';
const router = express.Router();

router.post('/register',authenticate,register);
router.post('/refreshToken',refreshToken);
router.post('/login',isVerifiedPass, login);


export default router;

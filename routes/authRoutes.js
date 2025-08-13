import express from 'express';
import { register, login, refreshToken } from '../controllers/authController.js';
import { authenticate, isVerifiedPass } from '../middlewares/auth.js';

const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/refreshToken',refreshToken);
authRouter.post('/login', isVerifiedPass, login);


export default authRouter;

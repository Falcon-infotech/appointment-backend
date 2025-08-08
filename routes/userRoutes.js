import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { deleteUser, getAllUsers, getUserById, updateUser, updateUserPassword } from '../controllers/userController.js';

const userRouter = express.Router();
userRouter.use(authenticate);

userRouter.get('/all',getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);
userRouter.put('/:id/password', updateUserPassword);

export default userRouter;
import express from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  updateCurrentUserController,
} from '../controllers/user.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const userRouter = express.Router();

userRouter.post('/register', ctrlWrapper(registerController));
userRouter.post('/login', ctrlWrapper(loginController));
userRouter.post('/refresh', ctrlWrapper(refreshTokenController));

userRouter.use(authMiddleware); // Захищає всі маршрути нижче
userRouter.get('/me', ctrlWrapper(getCurrentUserController));
userRouter.patch('/me', ctrlWrapper(updateCurrentUserController));
userRouter.post('/logout', ctrlWrapper(logoutController));

export default userRouter;

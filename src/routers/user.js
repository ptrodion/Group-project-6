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

const userRouter = express.Router();

userRouter.post('/register', registerController);
userRouter.post('/login', loginController);
userRouter.post('/refresh', refreshTokenController);

userRouter.use(authMiddleware); // Захищає всі маршрути нижче
userRouter.get('/me', getCurrentUserController);
userRouter.patch('/me', updateCurrentUserController);
userRouter.post('/logout', logoutController);

export default userRouter;

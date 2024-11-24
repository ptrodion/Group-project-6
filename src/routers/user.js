import { Router } from 'express';
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

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get('/find-one-user', ctrlWrapper(getCurrentUserController));

userRouter.post('/register', ctrlWrapper(registerController));
userRouter.post('/login', ctrlWrapper(loginController));
userRouter.post('/refresh', ctrlWrapper(refreshTokenController));
userRouter.post('/logout', ctrlWrapper(logoutController));

userRouter.patch(
  '/update-current-user',
  ctrlWrapper(updateCurrentUserController),
);

export default userRouter;

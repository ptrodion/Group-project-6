import { Router } from 'express';

import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  updateCurrentUserController,
} from '../controllers/user.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { upload } from '../middlewares/multer.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  loginUserSchema,
  registerUserSchema,
  updateCurrentUserSchema,
} from '../validation/user.js';

const userRouter = Router();

userRouter.post(
  '/register',
  upload.single('avatarUrlLocal'),
  validateBody(registerUserSchema),
  ctrlWrapper(registerController),
);
userRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginController),
);

userRouter.get(
  '/current',
  upload.single('avatarUrlLocal'),
  authMiddleware,
  ctrlWrapper(getCurrentUserController),
);

userRouter.patch(
  '/update-current-user',
  upload.single('avatarUrlLocal'),
  validateBody(updateCurrentUserSchema),
  authMiddleware,
  ctrlWrapper(updateCurrentUserController),
);

userRouter.post('/refresh', ctrlWrapper(refreshTokenController));

userRouter.post('/logout', ctrlWrapper(logoutController));

export default userRouter;

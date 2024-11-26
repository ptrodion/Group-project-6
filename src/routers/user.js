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
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginUserSchema,
  registerUserSchema,
  updateCurrentUserSchema,
} from '../validation/user.js';
// import { isValidId } from '../middlewares/isValidId.js';
import { upload } from '../middlewares/multer.js';

const userRouter = Router();

userRouter.post(
  '/register',
  upload.single('avatarUrl'),
  validateBody(registerUserSchema),
  ctrlWrapper(registerController),
);
userRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginController),
);

userRouter.get(
  '/find-one-user',
  // isValidId,
  upload.single('avatarUrl'),
  authMiddleware,
  ctrlWrapper(getCurrentUserController),
);

userRouter.patch(
  '/update-current-user',
  // isValidId,
  upload.single('avatarUrl'),
  validateBody(updateCurrentUserSchema),
  authMiddleware,
  ctrlWrapper(updateCurrentUserController),
);

userRouter.post('/refresh', ctrlWrapper(refreshTokenController));

userRouter.post('/logout', ctrlWrapper(logoutController));

export default userRouter;

import { Router } from 'express';

import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  updateCurrentUserController,
  getGoogleOAuthUrlController,
  confirmOAuthController
} from '../controllers/user.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { upload } from '../middlewares/multer.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  loginUserSchema,
  registerUserSchema,
  updateCurrentUserSchema,
  confirmOAuthSchema,
} from '../validation/user.js';

import { requestResetEmailSchema } from '../validation/user.js';
import { requestResetEmailController } from '../controllers/user.js';
import { resetPasswordSchema } from '../validation/user.js';
import { resetPasswordController } from '../controllers/user.js';

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
  '/current',
  upload.single('avatarUrl'),
  authMiddleware,
  ctrlWrapper(getCurrentUserController),
);

userRouter.patch(
  '/update-current-user',
  upload.single('avatarUrl'),
  validateBody(updateCurrentUserSchema),
  authMiddleware,
  ctrlWrapper(updateCurrentUserController),
);

userRouter.post('/refresh', ctrlWrapper(refreshTokenController));

userRouter.post('/logout', ctrlWrapper(logoutController));

userRouter.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));
userRouter.post('/confirm-oauth', validateBody(confirmOAuthSchema), ctrlWrapper(confirmOAuthController));

userRouter.post(
  '/request-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

userRouter.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

export default userRouter;

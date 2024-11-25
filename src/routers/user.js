import { Router } from 'express';
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
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginUserSchema,
  registerUserSchema,
  updateCurrentUserSchema,
} from '../validation/user.js';
// import { isValidId } from '../middlewares/isValidId.js';

const userRouter = Router();
const jsonParser = express.json({
  type: 'application/json',
});

userRouter.post(
  '/register',
  jsonParser,
  validateBody(registerUserSchema),
  ctrlWrapper(registerController),
);
userRouter.post(
  '/login',
  jsonParser,
  validateBody(loginUserSchema),
  ctrlWrapper(loginController),
);

userRouter.get(
  '/find-one-user',
  // isValidId,
  authMiddleware,
  ctrlWrapper(getCurrentUserController),
);

userRouter.patch(
  '/update-current-user',
  // isValidId,
  validateBody(updateCurrentUserSchema),
  authMiddleware,
  ctrlWrapper(updateCurrentUserController),
);

userRouter.post('/refresh', ctrlWrapper(refreshTokenController));

userRouter.post('/logout', ctrlWrapper(logoutController));

export default userRouter;

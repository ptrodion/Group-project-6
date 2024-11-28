import { Router } from 'express';
import {
  createWaterController,
  getWaterByIdController,
  updateWaterController,
  deleteWaterController,
  getWaterPerDayController,
  getWaterPerMonthController,
} from '../controllers/water.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createWaterSchema, updateWaterSchema } from '../validation/water.js';
import { isValidId } from '../middlewares/isValidId.js';

const waterRouter = Router();
waterRouter.use(authMiddleware);

waterRouter.post(
  '/water',
  validateBody(createWaterSchema),
  ctrlWrapper(createWaterController),
);

waterRouter.get(
  '/water/:waterId',
  isValidId,
  ctrlWrapper(getWaterByIdController),
);

waterRouter.patch(
  '/water/:waterId',
  isValidId,
  validateBody(updateWaterSchema),
  ctrlWrapper(updateWaterController),
);

waterRouter.delete(
  '/water/:waterId',
  isValidId,
  ctrlWrapper(deleteWaterController),
);

waterRouter.get(
  '/water/day/:date',

  ctrlWrapper(getWaterPerDayController),
);

waterRouter.get(
  '/water/month/:date',

  ctrlWrapper(getWaterPerMonthController),
);

export default waterRouter;


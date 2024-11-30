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
import {isValidDate} from '../middlewares/isValidDate.js';
import {isValidDay} from '../middlewares/isValidDay.js';
import {isValidMonth } from '../middlewares/isValidMonth.js';

const waterRouter = Router();
waterRouter.use(authMiddleware);

waterRouter.post(
  '/water',
  isValidDate,
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
  isValidDay,
  ctrlWrapper(getWaterPerDayController),
);

waterRouter.get(
  '/water/month/:date',
  isValidMonth ,
  ctrlWrapper(getWaterPerMonthController),
);

export default waterRouter;


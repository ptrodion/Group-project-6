import { Router } from 'express';
import {
  createWaterController,
  getWaterByIdController,
  updateWaterController,
  deleteWaterController,
  getWaterPerDayController,
  getWaterPerMonthController,
} from '../controllers/water.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createWaterSchema, updateWaterSchema } from '../validation/water.js';
import { isValidId } from '../middlewares/isValidId.js';

const waterRouter = Router();

waterRouter.post(
  '/',
  validateBody(createWaterSchema),
  ctrlWrapper(createWaterController),
);

waterRouter.get(
  '/:waterId',
  isValidId,
  ctrlWrapper(getWaterByIdController),
);

waterRouter.patch(
  '/:waterId',
  isValidId,
  validateBody(updateWaterSchema),
  ctrlWrapper(updateWaterController),
);

waterRouter.delete(
  '/:waterId',
  isValidId,
  ctrlWrapper(deleteWaterController),
);

waterRouter.get(
  '/day/:date',
  ctrlWrapper(getWaterPerDayController),
);

waterRouter.get(
  '/month/:date',
  ctrlWrapper(getWaterPerMonthController),
);

export default waterRouter;


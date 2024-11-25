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

const waterRouter = Router();

waterRouter.use(authMiddleware);

waterRouter.post('/water', ctrlWrapper(createWaterController));

waterRouter.get('/water/:id', ctrlWrapper(getWaterByIdController));

waterRouter.patch('/water/:id', ctrlWrapper(updateWaterController));

waterRouter.delete('/water/:id', ctrlWrapper(deleteWaterController));

waterRouter.get('/water/day/:date', ctrlWrapper(getWaterPerDayController));

waterRouter.get('/water/month/:date', ctrlWrapper(getWaterPerMonthController));

export default waterRouter;

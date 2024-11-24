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

const router = Router();

router.post('/water', ctrlWrapper(createWaterController));

router.get('/water/:id', ctrlWrapper(getWaterByIdController));

router.patch('/water/:id', ctrlWrapper(updateWaterController));

router.delete('/water/:id', ctrlWrapper(deleteWaterController));

router.get('/water/day/:date', ctrlWrapper(getWaterPerDayController));

router.get('/water/month/:date', ctrlWrapper(getWaterPerMonthController));

export default router;

import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import commonRouter from './common.js';
import userRouter from './user.js';
import waterRouter from './water.js';

const apiRouter = express.Router();

apiRouter.use('/', commonRouter);
apiRouter.use('/auth', userRouter);
apiRouter.use('/water',authMiddleware, waterRouter);

export default apiRouter;

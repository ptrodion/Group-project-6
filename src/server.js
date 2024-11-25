import express from 'express';
import cookieParser from 'cookie-parser';
import pino from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import commonRouter from './routers/common.js';
import userRouter from './routers/user.js';
import waterRouter from './routers/water.js';

export const setupServer = () => {
  const app = express();
  const PORT = Number(env('PORT', '3000'));

  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use('/api', commonRouter);
  app.use('/api', userRouter);
  app.use('/api', waterRouter);
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('/api', commonRouter);

  app.use('/api/auth', userRouter);

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

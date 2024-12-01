import express from 'express';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import pino from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import apiRouter from './routers/apiRouter.js';

export const setupServer = () => {
  const app = express();
  const PORT = Number(env('PORT', '3000'));

  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use('/api', apiRouter);
  app.use('/photos', express.static(path.resolve('src', 'public/photos')));
  app.use('/api-docs', swaggerDocs());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const setupServer = () => {
  const app = express();
  const PORT = Number(env('PORT', '3000'));

  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(cors());

  // Пример для описания роутеров.
  // app.use('/api', apiRoutes);

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

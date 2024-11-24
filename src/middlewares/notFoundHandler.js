import createHttpError from 'http-errors';

export const notFoundHandler = (_req, res, next) => {
  next(createHttpError(404, 'Route not found'));
};

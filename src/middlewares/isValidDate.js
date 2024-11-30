import createHttpError from 'http-errors';

export const isValidDate = (req, res, next) => {
  const { date } = req.body;

  if (!date) {
    throw createHttpError(400, 'Date is required');
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

  if (!datePattern.test(date)) {
    throw createHttpError(400, 'Invalid date format. Use YYYY-MM-DDThh:mm:ss');
  }

  next();
};

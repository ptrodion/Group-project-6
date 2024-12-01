import createHttpError from 'http-errors';
import {
  createWater,
  getWaterById,
  updateWaterById,
  deleteWaterById,
  getWaterPerDay,
  getWaterPerMonth,
  getCurrentDailyNormByUser,
} from '../services/water.js';
import { isValidDate, isValidMonthDate } from '..//middlewares/isValidDate.js';

export const createWaterController = async (req, res) => {
  const userId = req.user;

  const currentUser =  await getCurrentDailyNormByUser(userId);

  const { amount, date } = req.body;

  const data = {
    amount,
    date,
    currentDailyNorm : currentUser.currentDailyNorm,
    userId,
  };

  const water = await createWater(data);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a water record!',
    data: {
      id: water._id,
      date: water.date,
      amount: water.amount,
      currentDailyNorm: water.currentDailyNorm,
    },
  });
};

export const getWaterByIdController = async (req, res, next) => {
  const { waterId } = req.params; //from route
  const userId = req.user; //user's id from authMiddleware

  const water = await getWaterById(waterId, userId);

  if (!water) {
    return next(createHttpError(404, 'Water record not found'));
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found water record with ID: ${waterId}!`,
    data:{
      id: water._id,
      date: water.date,
      amount: water.amount,
      currentDailyNorm: water.currentDailyNorm,
    }
  });
};

export const updateWaterController = async (req, res, next) => {
  const { waterId } = req.params; //from route params
  const userId = req.user; //from authMiddleware
  const data = { ...req.body }; //data for update

  const updatedWater = await updateWaterById(waterId, userId, data);

  if (!updatedWater) {
    return next(createHttpError(404, 'Water record not found'));
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully updated the water record!',
    data:{
      id: updatedWater._id,
      date: updatedWater.date,
      amount: updatedWater.amount,
      currentDailyNorm: updatedWater.currentDailyNorm,
    }
  });
};

export const deleteWaterController = async (req, res, next) => {
  const { waterId } = req.params;
  const userId = req.user;

  const deletedWater = await deleteWaterById(waterId, userId);

  if (!deletedWater) {
    return next(createHttpError(404, 'Water record not found'));
  }

  res.status(204).send();
};

export const getWaterPerDayController = async (req, res, next) => {

  const userId = req.user; //from authMiddleware
  const { date } = req.params; //from query parametrs

  if (!isValidDate(date)) {
    throw createHttpError(400, 'Invalid date format. Please use YYYY-MM-DD.');
}

  const { data } = await getWaterPerDay(userId, date);

  if (!data || data.length === 0) {
    throw createHttpError(404, 'No water records found for the specified date.');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved daily water records!',
    data
  });
};

export const getWaterPerMonthController = async (req, res, next) => {
  const userId = req.user; // userId from authMiddleware
  const { date } = req.params; // ISO date string from request parametrs

  if (!date || !isValidMonthDate(date)) {
    throw createHttpError(400, 'Invalid date format. Please use YYYY-MM.');
}

  // call updated service
    const { data } = await getWaterPerMonth(userId, date);

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved monthly water records!",
      data
    });
};

import createHttpError from 'http-errors';
import {
  createWater,
  getWaterById,
  updateWaterById,
  deleteWaterById,
  getWaterPerDay,
  getWaterPerMonth,
} from '../services/water.js';

export const createWaterController = async (req, res) => {
  const userId = req.user; //id from authMiddleware
  const { amount, date, currentDailyNorm } = req.body;

  //data to be transfered to the service
  const data = {
    amount,
    date,
    currentDailyNorm,
    userId,
  };

  const water = await createWater(data);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a water record!',
    data: water,
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
    data: water,
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
    data: updatedWater,
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

  const { totalAmount, allRecords } = await getWaterPerDay(userId, date);

  if (!totalAmount || !allRecords) {
    //return { totalWater: 0, dailyRecords: [] };
    throw createHttpError(400, 'No records found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved daily water records!',
    data: {
      totalAmount,
      records: allRecords,
    },
  });
};

export const getWaterPerMonthController = async (req, res, next) => {
  const userId = req.user; // userId from authMiddleware
  const { date } = req.params; // ISO date string from request parametrs

  // call updated service
    const { totalWater, dailyRecords } = await getWaterPerMonth(userId, date);

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved monthly water records!",
      data: {
        totalWater,
        dailyRecords,
      },
    });

};

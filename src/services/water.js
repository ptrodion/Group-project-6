import createHttpError from 'http-errors';
import { WaterCollection } from '../db/models/water.js';
import { UsersCollection } from '../db/models/user.js';

//creating a new record(volume,date and userId)

export const getCurrentDailyNormByUser = async(userId) => {
  return await UsersCollection.findById(userId);

}

export const createWater = async (payload) => {
  let { amount, date, currentDailyNorm, userId } = payload;
  const water =  await WaterCollection.create({
    amount,
    date: date,
    currentDailyNorm,
    userId,
  });

  return water;
};

//get water consumption record(id record,userId)to check if there is such a record

export const getWaterById = async (waterId, userId) => {
  const water = await WaterCollection.findOne({
    _id: waterId,
    userId,
  });

  if (!water) return null;

  return water;
};

//update consumption record by id(waterId,userId,payload-new data for update-amount and date)

export const updateWaterById = async (
  waterId,
  userId,
  payload,
  options = {},
) => {
  const water = await getWaterById(waterId, userId);

  if (!water) return null;

  const {
    amount = water.amount,
    date = water.date,
    currentDailyNorm = water.currentDailyNorm,
  } = payload;

  const updatedWater = await WaterCollection.findOneAndUpdate(
    {
      _id: waterId,
      userId,
    },
    { amount, date, currentDailyNorm },
    {
      new: true,
      ...options,
    },
  );

  if (!updatedWater) return null;

  return updatedWater;
};

//delete consumption record by id(waterId,userId)

export const deleteWaterById = async (waterId, userId) => {
  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
    userId,
  });

  if (!water) return null;

  return water;
};

//get all records of water consumption per day

export const getWaterPerDay = async (userId, date) => {
  // convert the date string to Date object
  const dateObj = new Date(date);

  // get the start of the day (00:00:00)
  const startOfDay = new Date(dateObj);
  startOfDay.setUTCHours(0, 0, 0, 0);

  // get the end of the day (23:59:59.999)
  const endOfDay = new Date(dateObj);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // convert to ISO strings for filtering in  MongoDB
  const startOfDayISO = startOfDay.toISOString();
  const endOfDayISO = endOfDay.toISOString();

  // water records for the day
  const waterRecords = await WaterCollection.find({
    userId,
    date: { $gte: startOfDayISO, $lte: endOfDayISO },
  }).lean();

  if (!waterRecords) {
     return {
      value: [],
      totalAmount: 0,
    };
  }

  const allRecords = waterRecords.map((record) => ({
    id: record._id,
    amount: record.amount,
    date: record.date,
    currentDailyNorm: record.currentDailyNorm,
  }));

 const totalAmount = waterRecords.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    allRecords,
    totalAmount,
  };
};

//get water consumption per month
export const getWaterPerMonth = async (userId, date) => {

  const startOfMonth = new Date(date);
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
  endOfMonth.setUTCHours(23, 59, 59, 999);

  // get all the records for the month
  const waterRecords = await WaterCollection.find({
    userId,
    date: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
  }).lean();

  if (!waterRecords || waterRecords.length === 0) {
    //return { totalWater: 0, dailyRecords: [] };
    throw createHttpError(400, 'No records found');
  }

  // group records by days
  const groupedByDay = {};
  waterRecords.forEach((record) => {
    const day = record.date.split("T")[0]; // extract date without time
    if (!groupedByDay[day]) {
      groupedByDay[day] = 0;
    }
    groupedByDay[day] += record.amount;
  });

  // convert object to array
  const dailyRecords = Object.keys(groupedByDay).map((date) => ({
    date,
    totalAmount: groupedByDay[date],
  }));

  // total volume of water
  const totalWater = dailyRecords.reduce((sum, record) => sum + record.totalAmount, 0);

  return {
    totalWater,
    dailyRecords,
  };
};

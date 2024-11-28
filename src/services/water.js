import { WaterCollection } from '../db/models/water.js';

//creating a new record(volume,date and userId)

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

export const getWaterPerDay = async (userId, timestamp) => {
  const date = new Date(parseInt(timestamp));

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);


  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

   // Convert back to Unix timestamp
   const startOfDayTimestamp = startOfDay.getTime();
   const endOfDayTimestamp = endOfDay.getTime();

  console.log('Start of Day:', startOfDay);
  console.log('End of Day:', endOfDay);

  const waterRecords = await WaterCollection.find({
    userId,
    date: {
      $gte: startOfDayTimestamp,
      $lte: endOfDayTimestamp,
    },
  }).lean();

  if (!waterRecords || waterRecords.length === 0) {
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

  const totalAmount = waterRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return {
    allRecords,
    totalAmount,
  };
};

//get water consumption per month

export const getWaterPerMonth = async (userId, date) => {
  // Начало месяца
  const startOfMonth = new Date(`${date}-01T00:00:00.000Z`).toISOString();

  // Конец месяца
  const endOfMonth = new Date(`${date}-01T00:00:00.000Z`);
  endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1); // Переход на следующий месяц
  endOfMonth.setUTCDate(0); // Последний день предыдущего месяца
  endOfMonth.setUTCHours(23, 59, 59, 999); // Конец дня
  const endOfMonthISO = endOfMonth.toISOString();

  console.log('Start of Month:', startOfMonth);
  console.log('End of Month:', endOfMonthISO);

  const waterRecords = await WaterCollection.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonthISO },
  });

  const totalWater = waterRecords.reduce((sum, record) => sum + record.amount, 0);

  return totalWater;
};

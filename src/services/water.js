import { WaterCollection } from '../db/models/water.js';

//creating a new record(volume,date and userId)

export const createWater = async (payload) => {
  let { amount, date, currentDailyNorm, userId } = payload;
  const water =  await WaterCollection.create({
    amount,
    date: new Date(date),
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
  const startOfDay = new Date(`${date}T00:00:00Z`);
  const endOfDay = new Date(`${date}T23:59:59Z`);

  const waterRecords = await WaterCollection.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  const totalWater = waterRecords.reduce(
    (sum, record) => sum + record.amount,
    0,
  );
  //array of all records of a day

  const allRecords = waterRecords.map((record) => ({
    id: record._id,
    amount: record.amount,
    date: record.date,
    currentDailyNorm: record.currentDailyNorm,
  }));

  return { totalWater, allRecords };
};

//get water consumption per month

export const getWaterPerMonth = async (userId, date) => {
  const startOfMonth = new Date(`${date}-01T00:00:00.000Z`);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
  endOfMonth.setUTCDate(0);
  endOfMonth.setUTCHours(23, 59, 59, 999);

  const waterRecords = await WaterCollection.find({
    userId,
    date: { $gte: startOfMonth, $lt: endOfMonth},
  }).lean();

  const totalWater = waterRecords.reduce(
    (sum, record) => sum + record.amount,
    0,
  );

  return totalWater;
};

import { WaterCollection } from '../db/models/water.js';

//creating a new record(volume,date and userId)

export const createWater = async (payload) => {
  let { amount, date, currentDailyNorm, userId } = payload;

  const water = await WaterCollection.create({
    amount,
    date,
    currentDailyNorm,
    owner: userId,
  });

  const { _id, owner, ...other } = water.toObject();
  const data = { id: _id, ...other };
  return data;
};

//get water consumption record(id record,userId)to check if there is such a record

export const getWaterById = async (waterId, userId) => {
  const water = await WaterCollection.findOne({
    _id: waterId,
    owner: userId,
  });

  if (!water) return null;

  const { _id, owner, ...other } = water.toObject();
  const data = { id: _id, ...other };
  return data;
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
      owner: userId,
    },
    { amount, date, currentDailyNorm },
    {
      new: true,
      ...options,
    },
  );

  if (!updatedWater) return null;

  const { _id, owner, ...other } = updatedWater.toObject();
  const data = { id: _id, ...other };
  return data;
};

//delete consumption record by id(waterId,userId)

export const deleteWaterById = async (waterId, userId) => {
  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
    owner: userId,
  });

  if (!water) return null;

  const { _id, owner, ...other } = water.toObject();
  const data = { id: _id, ...other };
  return data;
};

//get all records of water consumption per day

export const getWaterPerDay = async ({ userId, date }) => {
  const startOfDay = new Date(`${date}T00:00:00Z`);
  const endOfDay = new Date(`${date}T23:59:59Z`);

  const waterRecords = await WaterCollection.find({
    owner: userId,
    date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() },
  }).lean();

  return waterRecords.map(({ _id, owner, ...rest }) => ({ id: _id, ...rest }));
};

//get water consumption per month

export const getWaterPerMonth = async ({ userId, date }) => {
  const startOfMonth = new Date(`${date}-01T00:00:00Z`);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const waterRecords = await WaterCollection.find({
    owner: userId,
    date: { $gte: startOfMonth.toISOString(), $lt: endOfMonth.toISOString() },
  }).lean();

  const dailyWater = {};

  waterRecords.forEach((record) => {
    const recordDate = new Date(record.date);
    const day = recordDate.toISOString().split('T')[0];

    if (!dailyWater[day]) {
      dailyWater[day] = 0;
    }

    dailyWater[day] += record.amount;
  });

  return Object.keys(dailyWater).map(([day, totalAmount]) => ({
    date: day,
    totalAmount,
  }));
};

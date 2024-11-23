import { UsersCollection } from '../db/models/user.js';

export const countUsers = async () => {
  return await UsersCollection.countDocuments();
};

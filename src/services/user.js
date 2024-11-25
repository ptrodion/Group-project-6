import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';

import { UsersCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';

const createSession = () => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
};

const createAndSaveSession = async (userId) => {
  const newSession = createSession();

  return await SessionCollection.create({ userId, ...newSession });
};

export const registerUser = async (payload) => {
  const userExists = await UsersCollection.findOne({ email: payload.email });

  if (userExists) {
    throw createHttpError(409, 'Email already in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);

  return UsersCollection.create(payload);
};

export const loginUser = async (email, password) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const userId = user._id;
  await SessionCollection.deleteOne({ userId });
  return await createAndSaveSession(userId);
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await SessionCollection.findById(sessionId);

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshToken !== refreshToken) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  await SessionCollection.deleteOne({ _id: session._id });
  return await createAndSaveSession(session.userId);
};

export const logoutUser = async (sessionId) => {
  return await SessionCollection.deleteOne({ _id: sessionId });
};

export const getCurrentUser = async (userId) => {
  const user = await UsersCollection.findById(userId, '-password');

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};

export const updateUser = async (userId, updateData) => {
  if (Object.keys(updateData).length === 0) {
    throw createHttpError(400, 'No data to update');
  }

  const updatedUser = await UsersCollection.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  return updatedUser;
};

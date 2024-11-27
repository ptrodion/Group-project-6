import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import fs from 'fs/promises';
import path from 'node:path';

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

export const registerUser = async (payload, file) => {
  const userExists = await UsersCollection.findOne({ email: payload.email });

  if (userExists) {
    throw createHttpError(409, 'Email already in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);
  if (file) {
    const avatarTempPath = file.path; // шлях до тимчасового файлу
    const avatarFinalPath = path.resolve('src', 'public/photos', file.filename);
    const uploadsDir = path.resolve('src', 'public/photos');
    await fs.mkdir(uploadsDir, { recursive: true });
    try {
      // Перемістити файл із тимчасової папки до постійної
      await fs.rename(avatarTempPath, avatarFinalPath);

      // Додати шлях до аватара у payload
      payload.avatarUrl = `/photos/${file.filename}`;
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      throw createHttpError(500, 'Error processing avatar upload');
    }
  }
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

export const updateUser = async (userId, updateData, file) => {
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
  if (file) {
    const avatarFilename = `${Date.now()}-${file.originalname}`;
    const avatarTempPath = file.path;
    const avatarFinalPath = path.resolve(
      'src',
      'public/photos',
      avatarFilename,
    );

    // Видалити старий аватар, якщо він є
    if (updatedUser.avatarUrl) {
      const oldAvatarPath = path.resolve(
        'src',
        'public/photos',
        updatedUser.avatarUrl,
      );
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.warn('Failed to delete old avatar:', error.message);
      }
    }

    // Перемістити новий аватар
    try {
      await fs.rename(avatarTempPath, avatarFinalPath);
      updateData.avatarUrl = `/photos/${avatarFilename}`;
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      throw createHttpError(500, 'Error processing avatar upload');
    }
  }

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  return updatedUser;
};

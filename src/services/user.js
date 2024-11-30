import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import fs from 'fs/promises';
import path from 'node:path';
import cloudinary from 'cloudinary';

import { UsersCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';

import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

const saveAvatar = async (file) => {
  let cloudinaryUrl = null;
  let localUrl = null;

  if (
    process.env.STORAGE_TYPE === 'cloudinary' ||
    process.env.STORAGE_TYPE === 'both'
  ) {
    const result = await uploadToCloudinary(file.path);
    cloudinaryUrl = result.secure_url;
  }

  if (
    process.env.STORAGE_TYPE === 'local' ||
    process.env.STORAGE_TYPE === 'both'
  ) {
    const uploadsDir = path.resolve('src', 'public/photos');
    await fs.mkdir(uploadsDir, { recursive: true });

    const avatarFilename = `${Date.now()}-${file.originalname}`;
    const avatarFinalPath = path.resolve(uploadsDir, avatarFilename);

    await fs.rename(file.path, avatarFinalPath);
    localUrl = `/photos/${avatarFilename}`;
  }

  return { cloudinaryUrl, localUrl };
};

const deleteAvatar = async (avatarUrl, storageType) => {
  if (!avatarUrl) return;

  try {
    if (storageType === 'cloudinary') {
      const publicId = avatarUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.v2.uploader.destroy(publicId);
    } else if (storageType === 'local') {
      const filePath = path.resolve('src', 'public', avatarUrl);
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.warn('Failed to delete avatar:', error.message);
  }
};

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

export const registerUser = async (payload, file, language) => {
  const userExists = await UsersCollection.findOne({
    email: payload.email,
  });

  if (userExists) {
    throw createHttpError(409, 'Email already in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);

  if (file) {
    const { cloudinaryUrl, localUrl } = await saveAvatar(file);

    payload.avatarUrlCloudinary = cloudinaryUrl;
    payload.avatarUrlLocal = localUrl;
  }

  const newUser = await UsersCollection.create(payload);

  return newUser.email;
};

export const loginUser = async (email, password) => {
  const user = await UsersCollection.findOne({ email: email.toLowerCase() });

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
  if (Object.keys(updateData).length === 0 && !file) {
    throw createHttpError(400, 'No data to update');
  }

  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (file) {
    if (user.avatarUrlCloudinary) {
      await deleteAvatar(user.avatarUrlCloudinary, 'cloudinary');
    }

    if (user.avatarUrlLocal) {
      await deleteAvatar(user.avatarUrlLocal, 'local');
    }

    const { cloudinaryUrl, localUrl } = await saveAvatar(file);

    updateData.avatarUrlCloudinary = cloudinaryUrl;
    updateData.avatarUrlLocal = localUrl;
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

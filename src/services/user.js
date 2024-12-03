import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import fs from 'fs/promises';
import path from 'node:path';
import cloudinary from 'cloudinary';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';

import { UsersCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';

import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';

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

const createAndSaveSession = async (userId, language) => {
  const newSession = createSession();
  newSession.language = language;

  return await SessionCollection.create({ userId, ...newSession });
};

export const registerUser = async (payload, file) => {
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
  const user = await UsersCollection.findOne({
    email: email.toLowerCase(),
  });

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

export const refreshSession = async (refreshToken) => {
  const session = await SessionCollection.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshToken !== refreshToken) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  await SessionCollection.deleteOne({ refreshToken });
  return await createAndSaveSession(session.userId);
};

export const logoutUser = async (sessionId) => {
  if (!sessionId) {
    throw createHttpError(401, 'Session not found');
  }

  return await SessionCollection.deleteOne({ _id: sessionId });
};

export const getCurrentUserByEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};
export const getCurrentUser = async (userId) => {
  const user = await UsersCollection.findById(userId);

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
    { ...updateData }, // Оновлені дані
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

export const loginOrRegisterUser = async (payload) => {
  let user = await UsersCollection.findOne({email: payload.email});

  if(user === null) {
    const password = await bcrypt.hash(crypto.randomBytes(30).toString('base64'), 10);

      user = await UsersCollection.create({
      name: payload.name,
      email:payload.email,
      password
    });
  } else {

    await SessionCollection.deleteMany({ userId: user._id });
}
    const newSession = createSession();

    const session =  await SessionCollection.create({
      userId: user._id,
      ...newSession,
    });
    return {
      _id: session._id,
      refreshToken: session.refreshToken,
      accessToken: newSession.accessToken,
     
  };
  };

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, env('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};

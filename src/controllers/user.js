import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  // requestResetEmail,
  // resetPassword,
} from '../services/user.js';

import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';

export const registerController = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    const registeredUser = await registerUser({
      name,
      email,
      password,
      gender,
    });

    res.status(201).json({
      status: 201,
      message: 'User registered successfully!',
      data: registeredUser,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const session = await loginUser(email, password);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: session.refreshTokenValidUntil,
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: true,
      expires: session.refreshTokenValidUntil,
    });

    res.status(200).json({
      status: 200,
      message: 'Logged in successfully!',
      accessToken: session.accessToken,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getCurrentUserController = async (req, res) => {
  try {
    const user = await UsersCollection.findById(req.user);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json({
      status: 200,
      message: 'User information retrieved successfully!',
      data: user,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateCurrentUserController = async (req, res) => {
  try {
    const { name, email, gender, weight, activeTime, dailyNorm, avatarUrl } =
      req.body;

    const updatedUser = await UsersCollection.findByIdAndUpdate(
      req.user,
      {
        name,
        email,
        gender,
        weight,
        activeTime,
        dailyNorm,
        avatarUrl,
      },
      { new: true },
    );

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json({
      status: 200,
      message: 'User updated successfully!',
      data: updatedUser,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await refreshSession(sessionId, refreshToken);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: session.refreshTokenValidUntil,
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: true,
      expires: session.refreshTokenValidUntil,
    });

    res.status(200).json({
      status: 200,
      message: 'Session refreshed successfully!',
      accessToken: session.accessToken,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await logoutUser(sessionId);
    }

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).end();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

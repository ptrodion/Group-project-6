import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  updateUser,
  getCurrentUser,
  loginOrRegisterUser,
  requestResetToken,
  resetPassword,
} from '../services/user.js';

import { generateAuthUrl, validateCode } from '../utils/googleOAuth2.js';

export const registerController = async (req, res) => {
  const payload = {
    language: req.body.language,
    email: req.body.email,
    password: req.body.password,
  };

  const file = req.file;

  const email = await registerUser(payload, file);

  res.status(201).json({
    status: 201,
    message: 'User registered successfully!',
    data: {
      email,
    },
  });
};

export const loginController = async (req, res) => {
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
    data: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    },
  });
};

export const getCurrentUserController = async (req, res) => {
  const user = await getCurrentUser(req.user);
  res.status(200).json({
    status: 200,
    message: 'User information retrieved successfully!',
    data: user,
  });
};

export const updateCurrentUserController = async (req, res) => {
  const updateData = req.body;

  const file = req.file;

  const updatedUser = await updateUser(req.user, updateData, file);

  res.status(200).json({
    status: 200,
    message: 'User updated successfully!',
    data: updatedUser,
  });
};

export const refreshTokenController = async (req, res) => {
  // const { sessionId, refreshToken } = req.cookies;
  const { refreshToken } = req.body;

  const session = await refreshSession(refreshToken);

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
    data: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    },
  });
};

export const logoutController = async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({
      status: 401,
      message: 'Session not found',
    });
  }

  if (accessToken) {
    await logoutUser(accessToken);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  res.status(204).end();
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();

  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const confirmOAuthController = async (req, res) => {
  const { code } = req.body;
  const ticket = await validateCode(code);

  const session = await loginOrRegisterUser({
    email: ticket.payload.email,
    name: ticket.payload.name,
  });

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
    message: 'Login with Google successfully.',
    data: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    },
  });
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.status(200).json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.status(200).json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};

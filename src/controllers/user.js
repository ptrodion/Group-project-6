import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  updateUser,
  getCurrentUser,
  // requestResetEmail,
  // resetPassword,
} from '../services/user.js';

const setupSession = (res, session) => {
  const { _id: sessionId, refreshToken, refreshTokenValidUntil } = session;

  const cookieOptions = {
    httpOnly: true,
    expires: refreshTokenValidUntil,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('sessionId', sessionId, cookieOptions);
};

export const registerController = async (req, res) => {
  // const { email, password, language } = req.body;
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
      email
    },
  });
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  const session = await loginUser(email, password);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Logged in successfully!',
    data: {
      accessToken: session.accessToken,
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
  const { sessionId, refreshToken } = req.cookies;

  const session = await refreshSession(sessionId, refreshToken);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Session refreshed successfully!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await logoutUser(sessionId);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).end();
};

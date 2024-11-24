import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  getCurrentUser,
  updateUser,
  // requestResetEmail,
  // resetPassword,
} from '../services/user.js';

export const registerController = async (req, res) => {
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
    accessToken: session.accessToken,
  });
};

export const getCurrentUserController = async (req, res) => {
  const user = await getCurrentUser();
  res.status(200).json({
    status: 200,
    message: 'User information retrieved successfully!',
    data: user,
  });
};

export const updateCurrentUserController = async (req, res) => {
  const updatedUser = await updateUser();

  res.status(200).json({
    status: 200,
    message: 'User updated successfully!',
    data: updatedUser,
  });
};

export const refreshTokenController = async (req, res) => {
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

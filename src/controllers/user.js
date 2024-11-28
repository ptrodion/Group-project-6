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

export const registerController = async (req, res) => {
  // const { name, email, password, gender, currentDailyNorm } = req.body;
  const { body } = req;
  const file = req.file;

  const registeredUser = await registerUser(body, file);

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
  console.log(req.body);
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

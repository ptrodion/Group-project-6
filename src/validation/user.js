import Joi from 'joi';

export const registerUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      'string.pattern.base': 'Please enter a valid email address',
      'any.required': 'email is required',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  language: Joi.string().valid('en', 'de', 'uk').optional(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      'string.pattern.base': 'Please enter a valid email address',
      'any.required': 'email is required',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  language: Joi.string().valid('en', 'de', 'uk'),
});

export const updateCurrentUserSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least 3 characters',
    'string.max': 'Username should have at most 20 characters',
  }),
  email: Joi.string()
    .email()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      'string.pattern.base': 'Please enter a valid email address',
      'any.required': 'email is required',
    }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password should be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  gender: Joi.string().valid('woman', 'man'),
  currentDailyNorm: Joi.number().integer().min(50).max(5000).messages({
    'any.required': 'CurrentDailyNorm is required',
    'number.integer': 'CurrentDailyNorm must be an integer',
    'number.min': 'CurrentDailyNorm must be at least 50',
    'number.max': 'CurrentDailyNorm must be at most 5000',
  }),
  avatarUrlCloudinary: Joi.string(),
  avatarUrlLocal: Joi.string(),
  weight: Joi.number().integer().min(0).messages({
    'number.integer': 'Weight must be an integer',
    'number.min': 'Weight cannot be less than 0',
  }),
  activeTime: Joi.number().integer().min(0).messages({
    'number.integer': 'ActiveTime must be an integer',
    'number.min': 'ActiveTime cannot be less than 0',
  }),
  language: Joi.string().valid('en', 'de', 'uk'),
});

export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});

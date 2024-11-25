import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(20).optional().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least 3 characters',
    'string.max': 'Username should have at most 20 characters',
  }),
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
  gender: Joi.string().valid('woman', 'man').required(),
  currentDailyNorm: Joi.number().min(50).max(5000).required(),
  avatarUrl: Joi.string().optional(),
  weight: Joi.number().min(0).optional(),
  activeTime: Joi.number().min(0).optional(),
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
  currentDailyNorm: Joi.number().min(50).max(5000),
  avatarUrl: Joi.string(),
  weight: Joi.number().min(0),
  activeTime: Joi.number().min(0),
});

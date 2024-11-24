// import Joi from 'joi';

// export const registerUserShema = Joi.object({
//   name: Joi.string().min(3).max(30),
//   email: Joi.string()
//     .email()
//     .required()
//     .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
//   password: Joi.string().min(8).max(20).required(),

// });

// export const updateUserSchema = Joi.object({
//   name: Joi.string().min(3).max(20).optional(),
//   phoneNumber: Joi.string().min(3).max(20).optional(),
//   email: Joi.string().email().optional(),
//   isFavourite: Joi.boolean().optional(),
//   contactType: Joi.string().valid('work', 'home', 'personal').optional(),
//   photo: Joi.string().optional(),
// });

// export const registerSchema = Joi.object({
//   name: Joi.string().min(3).max(20),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
// });

// export const loginSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
// });

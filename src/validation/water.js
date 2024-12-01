import Joi from 'joi';


export const createWaterSchema = Joi.object({
  amount: Joi.number().integer().required().example(50).messages({
    'number.base': 'The amount of water should be a number.',
    'number.integer': 'The amount of water should be a whole number.',
    'any.required': 'The amount of water is mandatory for filling.',
  }),
  date: Joi.string().required().example("2024-11-29T11:00:00.000Z").messages({
    'date.base': 'The date must be a string.',
    'any.required': 'The date is required.',
  }),
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.base': 'The userId must be a string.',
      'string.pattern.base': 'The userId must be a valid ObjectId.',
    }),
});

export const updateWaterSchema = Joi.object({
  amount: Joi.number().integer().example(50).messages({
    'number.base': 'The amount of water should be a number.',
    'number.integer': 'The amount of water should be a whole number.',

  }),
  date: Joi.string().example("2024-11-29T11:00:00.000Z").messages({
    'string.base': 'The date must be a string.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'You must specify at least one field to update.',
  });

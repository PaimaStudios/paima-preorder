import Joi from 'joi';

export const paginateSchema = {
  size: Joi.number().integer().min(1).max(100).optional(),
  page: Joi.number().integer().min(0).optional(),
};

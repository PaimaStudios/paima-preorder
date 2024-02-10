import Joi from 'joi';

export const paginateSchema = {
  size: Joi.number().integer().min(1).max(100).optional(),
  page: Joi.number().integer().min(0).optional(),
};

export const getIdentitiesPolicy = Joi.object().keys({
  owner: Joi.string().optional(),
  filter: Joi.string().optional(),
  ...paginateSchema,
});

export const getIdentityPolicy = Joi.object().keys({
  identity: Joi.string().required(),
});

export const getClaimHistoryPolicy = Joi.object().keys({
  identity: Joi.string().required(),
  types: Joi.array().items(Joi.string()).optional(),
  ...paginateSchema,
});

export const getProfilePolicy = Joi.object().keys({
  owner: Joi.string().required(),
});

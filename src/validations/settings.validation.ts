import Joi from 'joi';

const uiSettings = {
  ui: Joi.object().keys({}).unknown(true),
};

const createSettings = {
  body: Joi.object().keys({
    desktop: Joi.object().keys({
      ...uiSettings,
    }),
    mobile: Joi.object().keys({
      ...uiSettings,
    }),
  }),
};

const getSettings = {
  query: Joi.object().keys({
    isMobile: Joi.bool(),
  }),
};

const updateSettings = {
  body: Joi.object()
    .keys({
      desktop: Joi.object().keys({
        ...uiSettings,
      }),
      mobile: Joi.object().keys({
        ...uiSettings,
      }),
    })
    .min(1),
};

const deleteSettings = {};

export default {
  createSettings,
  getSettings,
  updateSettings,
  deleteSettings,
};

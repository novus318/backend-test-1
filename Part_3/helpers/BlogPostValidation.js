import Joi from 'joi';

const blogPostValidationSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

export default blogPostValidationSchema;


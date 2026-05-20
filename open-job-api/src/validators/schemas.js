const Joi = require('joi');

const UserSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('candidate', 'recruiter', 'admin', 'user').optional().allow('').default('candidate'),
});

const CompanySchema = Joi.object({
  name: Joi.string().max(150).required(),
  description: Joi.string().required(),              // ← required
  industry: Joi.string().max(100).optional().allow('', null),
  location: Joi.string().max(150).required(),        // ← required
  website: Joi.string().uri().optional().allow('', null),
  logo_url: Joi.string().optional().allow('', null),
});

const CompanyUpdateSchema = Joi.object({
  name: Joi.string().max(150).optional(),
  description: Joi.string().optional().allow('', null),
  industry: Joi.string().max(100).optional().allow('', null),
  location: Joi.string().max(150).optional().allow('', null),
  website: Joi.string().uri().optional().allow('', null),
  logo_url: Joi.string().optional().allow('', null),
});

const CategorySchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().optional().allow(''),
});

const JobSchema = Joi.object({
  company_id: Joi.string().required(),
  category_id: Joi.string().required(),
  title: Joi.string().max(150).required(),
  description: Joi.string().optional().allow(''),
  requirements: Joi.string().optional().allow(''),
  location: Joi.string().max(150).optional().allow(''),
  location_type: Joi.string().optional().allow(''),      
  location_city: Joi.string().optional().allow(''),      
  salary_min: Joi.number().integer().optional().allow(null),
  salary_max: Joi.number().integer().optional().allow(null),
  is_salary_visible: Joi.boolean().optional(),           
  job_type: Joi.string().max(50).optional().allow(''),
  experience_level: Joi.string().optional().allow(''),   
  status: Joi.string().valid('open', 'closed').default('open'),
});

const JobUpdateSchema = Joi.object({
  company_id: Joi.string().optional(),
  category_id: Joi.string().optional(),
  title: Joi.string().max(150).optional(),
  description: Joi.string().optional().allow(''),
  requirements: Joi.string().optional().allow(''),
  location: Joi.string().max(150).optional().allow(''),
  location_type: Joi.string().optional().allow(''),
  location_city: Joi.string().optional().allow(''),
  salary_min: Joi.number().integer().optional().allow(null),
  salary_max: Joi.number().integer().optional().allow(null),
  is_salary_visible: Joi.boolean().optional(),
  job_type: Joi.string().max(50).optional().allow(''),
  experience_level: Joi.string().optional().allow(''),
  status: Joi.string().valid('open', 'closed').optional(),
});

const ApplicationSchema = Joi.object({
  job_id: Joi.string().required(),
  cover_letter: Joi.string().optional().allow(''),
  status: Joi.string().valid('pending', 'reviewed', 'accepted', 'rejected').optional().default('pending'),
  user_id: Joi.string().optional(),
});

const ApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewed', 'accepted', 'rejected').required(),
});

const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const RefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  UserSchema,
  CompanySchema,
  CompanyUpdateSchema,
  CategorySchema,
  JobSchema,
  JobUpdateSchema,
  ApplicationSchema,
  ApplicationStatusSchema,
  LoginSchema,
  RefreshTokenSchema,
};
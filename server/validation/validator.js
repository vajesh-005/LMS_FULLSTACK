const Joi = require("joi");

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});



exports.addUserSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  emp_type_id: Joi.number().integer().required().messages({
    "any.required": "Employee type is required",
  }),
  manager_id: Joi.number().integer().required().messages({
    "any.required": "Manager ID is required",
  }),
  contact_number: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Contact number is required",
      "string.pattern.base": "Invalid contact number format",
    }),
});

exports.leaveRequestSchema = {
    params: Joi.object({
      id: Joi.number().integer().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
        "number.integer": "User ID must be an integer",
      }),
    }),
  
    payload: Joi.object({
      leave_type_id: Joi.number().integer().required().messages({
        "any.required": "Leave type is required",
        "number.base": "Leave type must be a number",
        "number.integer": "Leave type must be an integer",
      }),
      start_date: Joi.date().required().messages({
        "any.required": "Start date is required",
        "date.base": "Start date must be a valid date",
      }),
      end_date: Joi.date().required().messages({
        "any.required": "End date is required",
        "date.base": "End date must be a valid date",
      }),
      reason: Joi.string().min(3).required().messages({
        "string.empty": "Reason is required",
        "string.min": "Reason must be at least 3 characters",
        "any.required": "Reason is required",
      }),
      start_day_type: Joi.number()
      .valid(0, 1, 2)
      .default(0),
    
    end_day_type: Joi.number()
      .valid(0, 1, 2)
      .default(0),
    
    }),
  };
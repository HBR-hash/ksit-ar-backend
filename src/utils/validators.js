import Joi from "joi";

const phoneSchema = Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required();

const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*\d).+$/)
    .required();

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(60).required(),
    email: Joi.string().email().required(),
    phone: phoneSchema,
    password: passwordSchema
});

export const otpSchema = Joi.object({
    phone: phoneSchema,
    code: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required(),
    purpose: Joi.string().valid("register", "reset").required()
});

export const sendOtpSchema = Joi.object({
    phone: phoneSchema,
    purpose: Joi.string().valid("register", "reset").required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
    phone: phoneSchema,
    code: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required(),
    newPassword: passwordSchema
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(60),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
	profileImage: Joi.string().uri().allow(null, '')  // ✅ ADD THIS LINE
}).min(1);


/*export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  email: Joi.string().email(),
  phone: phoneSchema
}).min(1);
*/
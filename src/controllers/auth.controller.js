import { asyncHandler } from "../utils/asyncHandler.js";
import {
    registerSchema,
    sendOtpSchema,
    otpSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../utils/validators.js";

import { User } from "../models/User.js";
import {
    issueOtp,
    resendOtp,
    verifyOtpCode
} from "../services/otp.service.js"; // Fast2SMS service

import { hashPassword, comparePassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";
import { recordLogin, recordNewUser } from "../services/analytics.service.js";


// REGISTER
export const register = asyncHandler(async(req, res) => {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { name, email, phone, password } = value;

    const existing = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existing) {
        return res
            .status(409)
            .json({ message: "Account with email or phone already exists." });
    }

    const hashedPassword = await hashPassword(password);

    await issueOtp({
        phone,
        purpose: "register",
        payload: {
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword
        }
    });

    res.json({
        message: "OTP sent for registration. Please verify within 5 minutes."
    });
});


// RESEND OTP
export const sendOtp = asyncHandler(async(req, res) => {
    const { value, error } = sendOtpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { phone, purpose } = value;

    if (purpose === "register") {
        const pending = await User.findOne({ phone });
        if (pending) {
            return res.status(400).json({
                message: "User already registered with this phone."
            });
        }
    } else if (purpose === "reset") {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: "No account linked to phone." });
        }
    }

    await resendOtp({ phone, purpose });
    res.json({ message: "OTP resent successfully." });
});


// VERIFY OTP (Registration)
export const verifyOtp = asyncHandler(async(req, res) => {
    const { value, error } = otpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { phone, purpose, code } = value;

    if (purpose !== "register") {
        return res.status(400).json({
            message: "OTP verification endpoint is for registration only."
        });
    }

    const otp = await verifyOtpCode({ phone, purpose, code });

    const payload = otp.payload;

    if (!payload) {
        return res.status(400).json({ message: "Registration data missing." });
    }

    let user = await User.findOne({ phone });

    if (!user) {
        user = await User.create({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            password: payload.password,
            isVerified: true,
            lastLoginAt: new Date()
        });
        await recordNewUser();
    } else if (!user.isVerified) {
        user.name = payload.name;
        user.email = payload.email;
        user.password = payload.password;
        user.isVerified = true;
        user.lastLoginAt = new Date();
        await user.save();
    }

    await recordLogin();

    const token = createToken({ id: user.id });

    return res.json({
        message: "Registration verified.",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        }
    });
});


// LOGIN
export const login = asyncHandler(async(req, res) => {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { email, password } = value;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await recordLogin();

    const token = createToken({ id: user.id });

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        }
    });
});


// FORGOT PASSWORD
export const forgotPassword = asyncHandler(async(req, res) => {
    const { value, error } = forgotPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({
        email: value.email.toLowerCase()
    });

    if (!user) {
        return res.status(404).json({
            message: "No account found with this email address."
        });
    }

    await issueOtp({
        phone: user.phone,
        purpose: "reset",
        payload: { userId: user.id }
    });

    res.json({
        message: "OTP sent to registered phone for password reset."
    });
});


// RESET PASSWORD
export const resetPassword = asyncHandler(async(req, res) => {
    const { value, error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { phone, code, newPassword } = value;

    const otp = await verifyOtpCode({
        phone,
        purpose: "reset",
        code
    });

    const userId = otp.payload?.userId;

    if (!userId) {
        return res.status(400).json({ message: "Reset data missing." });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({
        message: "Password reset successful. Please login again."
    });
});
import path from "path";
import dotenv from "dotenv";

const rootDir = process.cwd();

dotenv.config({ path: path.join(rootDir, ".env") });

const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "FAST2SMS_API_KEY",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "UE_PACKAGE_NAME",
    "UE_ACTIVITY_NAME"
];

required.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`[config] Missing env var: ${key}`);
    }
});

export const config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,

    mongoUri: process.env.MONGODB_URI || "",
    jwtSecret: process.env.JWT_SECRET || "",

    otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 5),
    otpResendLimit: Number(process.env.OTP_RESEND_LIMIT || 3),

    fast2smsKey: process.env.FAST2SMS_API_KEY || "",

    adminSeed: {
        email: process.env.ADMIN_EMAIL || "",
        password: process.env.ADMIN_PASSWORD || ""
    },

    unreal: {
        packageName: process.env.UE_PACKAGE_NAME || "",
        activityName: process.env.UE_ACTIVITY_NAME || ""
    }
};
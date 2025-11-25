import dayjs from "dayjs";
import axios from "axios";
import { Otp } from "../models/Otp.js";
import { config } from "../config/env.js";

const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const sendFast2Sms = async({ to, code }) => {
    const url = "https://www.fast2sms.com/dev/bulkV2";

    const params = {
        authorization: config.fast2smsKey,
        route: "q",
        message: "Your KSIT AR OTP is " + code,
        numbers: to,
        flash: 0
    };

    try {
        const response = await axios.get(url, { params });
        console.log("Fast2SMS Response:", response.data);
        return response.data;
    } catch (err) {
        let errorMessage = "Unknown error";

        if (err && err.response && err.response.data) {
            errorMessage = err.response.data;
        } else if (err && err.message) {
            errorMessage = err.message;
        }

        console.error("Fast2SMS Error:", errorMessage);
        throw new Error("Unable to send OTP SMS. Please try again later.");
    }
};

export const issueOtp = async({ phone, purpose, payload }) => {
    await Otp.updateMany({ phone, purpose, consumed: false }, { consumed: true });

    const code = generateCode();
    const expiresAt = dayjs().add(config.otpExpiryMinutes, "minute").toDate();

    // Log OTP for debugging
    console.log("Generated OTP:", code);

    const otp = await Otp.create({
        phone,
        purpose,
        code,
        expiresAt,
        resendCount: 0,
        consumed: false,
        payload
    });

    await sendFast2Sms({ to: phone, code });

    return otp;
};

export const resendOtp = async({ phone, purpose }) => {
    const otp = await Otp.findOne({ phone, purpose, consumed: false })
        .sort({ createdAt: -1 })
        .exec();

    if (!otp) {
        throw new Error("No active OTP found. Please initiate again.");
    }

    if (otp.resendCount >= config.otpResendLimit) {
        const err = new Error("OTP resend limit reached. Please wait and retry.");
        err.status = 429;
        throw err;
    }

    if (otp.expiresAt < new Date()) {
        const err = new Error("OTP expired. Please request a new one.");
        err.status = 400;
        throw err;
    }

    otp.resendCount += 1;
    await otp.save();

    // Log OTP for resend as well
    console.log("Resending OTP:", otp.code);

    await sendFast2Sms({ to: phone, code: otp.code });

    return otp;
};

export const verifyOtpCode = async({ phone, purpose, code }) => {
    const otp = await Otp.findOne({ phone, purpose, consumed: false })
        .sort({ createdAt: -1 })
        .exec();

    if (!otp) {
        const err = new Error("OTP not found. Please request a new code.");
        err.status = 404;
        throw err;
    }

    if (otp.expiresAt < new Date()) {
        const err = new Error("OTP expired. Please request a new code.");
        err.status = 400;
        throw err;
    }

    if (otp.code !== code) {
        const err = new Error("Invalid OTP code.");
        err.status = 400;
        throw err;
    }

    otp.consumed = true;
    await otp.save();

    return otp;
};
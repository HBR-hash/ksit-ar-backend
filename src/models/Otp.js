import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["register", "reset"],
      required: true
    },
    expiresAt: { type: Date, required: true },
    resendCount: { type: Number, default: 0 },
    payload: { type: mongoose.Schema.Types.Mixed },
    consumed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, purpose: 1, consumed: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);




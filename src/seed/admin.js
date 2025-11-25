import { Admin } from "../models/Admin.js";
import { config } from "../config/env.js";
import { hashPassword, comparePassword } from "../utils/password.js";

export const seedAdmin = async () => {
  const { email, password } = config.adminSeed;
  if (!email || !password) {
    console.warn("[seed] Admin credentials missing; skipping admin seed");
    return;
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (!existing) {
    await Admin.create({
      email: email.toLowerCase(),
      password: await hashPassword(password)
    });
    console.log("[seed] Admin account created");
    return;
  }

  const samePassword = await comparePassword(password, existing.password);
  if (!samePassword) {
    existing.password = await hashPassword(password);
    await existing.save();
    console.log("[seed] Admin password refreshed");
  }
};




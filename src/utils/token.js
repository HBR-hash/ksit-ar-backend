import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const createToken = (payload, options = {}) =>
  jwt.sign(payload, config.jwtSecret, {
    expiresIn: options.expiresIn || "7d"
  });




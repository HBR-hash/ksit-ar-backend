import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // ✅ AR App Installation Status
    arAppInstalled: { type: Boolean, default: false },
    
    // ✅ Profile Image
    profileImage: { type: String, default: null }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

/*import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // ✅ New field
    arAppInstalled: { type: Boolean, default: false }
}, { timestamps: true });
	

export const User = mongoose.model("User", userSchema);





import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
}, { timestamps: true });
arAppInstalled: { type: Boolean, default: false }

export const User = mongoose.model("User", userSchema);*/
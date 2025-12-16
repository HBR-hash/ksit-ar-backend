import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { updateUserSchema } from "../utils/validators.js";

export const getProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profileImage: user.profileImage,
        arAppInstalled: user.arAppInstalled
    });
});

export const updateProfile = asyncHandler(async(req, res) => {
    const { value, error } = updateUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const updates = {};
    if (value.name) updates.name = value.name;
    if (value.email) updates.email = value.email.toLowerCase();
    if (value.phone) updates.phone = value.phone;
    
    // ✅ Handle profileImage
    if (value.profileImage !== undefined) {
        updates.profileImage = value.profileImage;
    }

    // Check email uniqueness
    if (value.email) {
        const existing = await User.findOne({
            email: value.email.toLowerCase(),
            _id: { $ne: req.user.id }
        });
        if (existing) {
            return res.status(409).json({ message: "Email already in use." });
        }
    }

    // Check phone uniqueness
    if (value.phone) {
        const existingPhone = await User.findOne({
            phone: value.phone,
            _id: { $ne: req.user.id }
        });
        if (existingPhone) {
            return res.status(409).json({ message: "Phone already in use." });
        }
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true
    }).lean();

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        arAppInstalled: user.arAppInstalled,
        profileImage: user.profileImage,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
    });
});

export const deleteAccount = asyncHandler(async(req, res) => {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully." });
});

export const updateARStatus = asyncHandler(async(req, res) => {
    const { installed } = req.body;

    if (typeof installed !== "boolean") {
        return res.status(400).json({ message: "Invalid value for installed." });
    }

    await User.findByIdAndUpdate(req.user.id, {
        arAppInstalled: installed
    });

    res.json({ message: "AR installation status updated.", installed });
});
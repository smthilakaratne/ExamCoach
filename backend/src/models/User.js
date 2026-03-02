const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

/**
 * @typedef {object} User
 * @property {string} name.required - Full name
 * @property {string} email.required - Email address
 * @property {string} password.required - Hashed password (not returned in queries by default)
 * @property {string} role - User role - enum:student,admin
 * @property {string} avatar - Avatar URL
 * @property {string} bio - Short bio
 * @property {boolean} isEmailVerified - Whether email has been OTP-verified
 * @property {boolean} isActive - Account active status
 * @property {string} [emailOTP] - 6-digit OTP (select:false)
 * @property {Date}   [emailOTPExpiry] - OTP expiry (select:false)
 * @property {string} [passwordResetToken] - Hashed reset token (select:false)
 * @property {Date}   [passwordResetExpiry] - Reset token expiry (select:false)
 * @property {Date}   [lastLogin] - Last login timestamp
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        avatar: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            maxlength: [300, "Bio cannot exceed 300 characters"],
            default: "",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // OTP fields – never returned in normal queries
        emailOTP: { type: String, select: false },
        emailOTPExpiry: { type: Date, select: false },
        // Password reset fields – never returned in normal queries
        passwordResetToken: { type: String, select: false },
        passwordResetExpiry: { type: Date, select: false },
        lastLogin: { type: Date },
    },
    { timestamps: true }
)

// Hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

/** Compare plain password with stored hash */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

/** Returns true if the provided OTP matches and has not expired */
userSchema.methods.isOTPValid = function (otp) {
    return this.emailOTP === otp && this.emailOTPExpiry > Date.now()
}

module.exports = mongoose.model("User", userSchema)
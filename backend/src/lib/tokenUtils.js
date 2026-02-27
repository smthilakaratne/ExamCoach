const crypto = require("crypto")

/** Generate a random 6-digit OTP string */
const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString()

/** Generate a cryptographically random hex token */
const generateToken = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex")

/** SHA-256 hash a token (for safe DB storage) */
const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex")

module.exports = { generateOTP, generateToken, hashToken }
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

const FROM = `"${process.env.SENDER_NAME || "ExamCoach"}" <${process.env.SENDER_EMAIL}>`

/**
 * Send 6-digit OTP for email verification.
 */
const sendOTPEmail = async (to, otp, name) => {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: "ExamCoach – Verify Your Email (OTP)",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#4F46E5;padding:24px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:22px">ExamCoach</h1>
            </div>
            <div style="padding:32px">
                <h2 style="margin-top:0">Hi ${name},</h2>
                <p>Your email verification OTP is:</p>
                <div style="background:#F3F4F6;border-radius:8px;padding:20px;text-align:center;
                            letter-spacing:10px;font-size:36px;font-weight:700;color:#4F46E5">
                    ${otp}
                </div>
                <p style="margin-top:24px;color:#6B7280;font-size:13px">
                    This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
                </p>
            </div>
        </div>`,
    })
}

/**
 * Send 6-digit OTP for forgot password reset.
 */
const sendForgotPasswordOTPEmail = async (to, otp, name) => {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: "ExamCoach – Password Reset OTP",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#4F46E5;padding:24px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:22px">ExamCoach</h1>
            </div>
            <div style="padding:32px">
                <h2 style="margin-top:0">Hi ${name},</h2>
                <p>We received a request to reset your password. Use the OTP below:</p>
                <div style="background:#FEF3C7;border-radius:8px;padding:20px;text-align:center;
                            letter-spacing:10px;font-size:36px;font-weight:700;color:#D97706">
                    ${otp}
                </div>
                <p style="margin-top:24px;color:#6B7280;font-size:13px">
                    This OTP expires in <strong>10 minutes</strong>. If you did not request a
                    password reset, you can safely ignore this email.
                </p>
            </div>
        </div>`,
    })
}

/**
 * Send welcome email after successful email verification.
 */
const sendWelcomeEmail = async (to, name) => {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: "Welcome to ExamCoach! 🎉",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#4F46E5;padding:24px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:22px">ExamCoach</h1>
            </div>
            <div style="padding:32px">
                <h2 style="margin-top:0">Welcome, ${name}! 🎉</h2>
                <p>Your email has been verified. You can now log in and start your exam journey.</p>
                <div style="text-align:center;margin:32px 0">
                    <a href="${process.env.CLIENT_URL}/login"
                       style="background:#4F46E5;color:#fff;padding:14px 32px;border-radius:6px;
                              text-decoration:none;font-weight:600">
                        Go to Login
                    </a>
                </div>
            </div>
        </div>`,
    })
}

module.exports = { sendOTPEmail, sendForgotPasswordOTPEmail, sendWelcomeEmail }
// utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// =======================================
// 🔥 Gmail SMTP Transporter (No localhost)
// =======================================
const transporter = nodemailer.createTransport({
  service: "gmail",  // Forces Gmail SMTP
  auth: {
    user: process.env.SMTP_USER,    // must be Gmail address
    pass: process.env.SMTP_PASS     // must be APP password
  }
});


// ===============================
// Send OTP for account verification
// ===============================
export const sendOTPEmail = async (email, otp, role) => {
  const subject = role === 'student' 
    ? "Your Student Account Password Setup OTP - EcoQuest"
    : "Your Faculty Account Password Setup OTP - EcoQuest";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">EcoQuest</h2>
      <h3>Password Setup Verification</h3>
      <p>Dear ${role === 'student' ? 'Student' : 'Faculty Member'},</p>
      <p>Use the OTP below to verify your email address:</p>

      <div style="background-color:#f3f4f6;padding:15px;text-align:center;margin:20px 0;">
        <h1 style="margin:0;color:#059669;letter-spacing:5px;font-size:32px;">${otp}</h1>
      </div>

      <p><strong>This OTP will expire in 15 minutes.</strong></p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
      <p style="color:#6b7280;font-size:12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"EcoQuest" <${process.env.SMTP_USER}>`,  // MUST match Gmail
    to: email,
    subject,
    html,
  });

  console.log(`📩 OTP email sent successfully to ${email}`);
};



// ===============================
// Send Password Reset Email (Link)
// ===============================
export const sendPasswordResetEmail = async (email, resetToken, role, name = "") => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const subject = role === 'student'
    ? "Password Reset Request - EcoQuest Student"
    : "Password Reset Request - EcoQuest Faculty";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <div style="background:#059669;padding:25px;text-align:center;color:white;border-radius:10px 10px 0 0;">
        <h1>🌿 EcoQuest</h1>
      </div>

      <div style="padding:25px;background:white;border-radius:0 0 10px 10px;">
        <h2 style="color:#059669;">Reset Your Password</h2>

        <p>Hello ${name || "User"},</p>
        <p>Click the button below to reset your password:</p>

        <div style="text-align:center;margin:25px 0;">
          <a href="${resetLink}" 
            style="background:#059669;color:white;padding:14px 30px;border-radius:6px;
            text-decoration:none;font-size:16px;font-weight:bold;">
            Reset Password
          </a>
        </div>

        <p>If button doesn't work, use this link:</p>
        <p style="background:#f3f4f6;padding:10px;border-radius:6px;">${resetLink}</p>

        <p><strong>Link expires in 1 hour</strong></p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"EcoQuest Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });

  console.log(`🔐 Password reset email sent to ${email}`);
};

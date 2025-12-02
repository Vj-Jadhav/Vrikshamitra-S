// utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// =======================================
// 🔥 Gmail SMTP Transporter (No localhost)
// =======================================
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",  // Forces Gmail SMTP
    auth: {
      user: process.env.SMTP_USER,    // must be Gmail address
      pass: process.env.SMTP_PASS     // must be APP password
    }
  });
};

// ===============================
// Send OTP for account verification
// ===============================
export const sendOTPEmail = async (email, otp, role) => {
  let subject, html;

  // Determine subject and content based on role and context
  if (role === 'student' || role === 'faculty') {
    subject = role === 'student' 
      ? "Your Student Account Password Setup OTP - EcoQuest"
      : "Your Faculty Account Password Setup OTP - EcoQuest";

    html = `
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
  } else {
    // For password reset OTPs
    subject = "Password Reset OTP - EcoQuest";
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">EcoQuest</h2>
        <h3>Password Reset Verification</h3>
        <p>Dear User,</p>
        <p>Use the OTP below to reset your password:</p>

        <div style="background-color:#f3f4f6;padding:15px;text-align:center;margin:20px 0;">
          <h1 style="margin:0;color:#059669;letter-spacing:5px;font-size:32px;">${otp}</h1>
        </div>

        <p><strong>This OTP will expire in 10 minutes.</strong></p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#6b7280;font-size:12px;">This is an automated email. Please do not reply.</p>
      </div>
    `;
  }

  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"EcoQuest" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });
    
    console.log(`📩 OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// ===============================
// Send Password Reset Email (Link)
// ===============================
export const sendPasswordResetEmail = async (email, resetToken, role, name = "") => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const subject = role === 'student'
    ? "Password Reset Request - EcoQuest Student"
    : role === 'faculty'
    ? "Password Reset Request - EcoQuest Faculty"
    : "Password Reset Request - EcoQuest";

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
        <p style="background:#f3f4f6;padding:10px;border-radius:6px;word-break:break-all;">${resetLink}</p>

        <p><strong>Link expires in 1 hour</strong></p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"EcoQuest Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log(`🔐 Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// ===============================
// Send Welcome Email
// ===============================
export const sendWelcomeEmail = async (email, name, role, instituteName = "") => {
  const subject = `Welcome to EcoQuest - ${role.charAt(0).toUpperCase() + role.slice(1)} Account`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <div style="background:#059669;padding:25px;text-align:center;color:white;border-radius:10px 10px 0 0;">
        <h1>🌿 Welcome to EcoQuest!</h1>
      </div>

      <div style="padding:25px;background:white;border-radius:0 0 10px 10px;">
        <h2 style="color:#059669;">Hello ${name},</h2>
        
        <p>Welcome to EcoQuest! Your ${role} account has been successfully created.</p>
        
        ${instituteName ? `<p><strong>Institute:</strong> ${instituteName}</p>` : ''}
        
        <p>You can now access your account and explore all the features available to you.</p>
        
        <div style="background:#f0f9ff;padding:15px;border-radius:6px;margin:20px 0;">
          <h3 style="color:#0369a1;margin-top:0;">Getting Started:</h3>
          <ul>
            <li>Access your dashboard</li>
            <li>Update your profile information</li>
            <li>Explore available courses and materials</li>
            <li>Connect with your ${role === 'student' ? 'teachers and classmates' : 'students and colleagues'}</li>
          </ul>
        </div>

        <p>If you have any questions, please contact your institution's administrator.</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#6b7280;font-size:12px;">
          This is an automated welcome message from EcoQuest.
        </p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"EcoQuest Welcome" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log(`👋 Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// ===============================
// Send Account Approval Email
// ===============================
export const sendApprovalEmail = async (email, instituteName) => {
  const subject = "Institute Account Approved - EcoQuest";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <div style="background:#059669;padding:25px;text-align:center;color:white;border-radius:10px 10px 0 0;">
        <h1>🎉 Account Approved!</h1>
      </div>

      <div style="padding:25px;background:white;border-radius:0 0 10px 10px;">
        <h2 style="color:#059669;">Congratulations!</h2>
        
        <p>Your institute <strong>${instituteName}</strong> has been approved on EcoQuest!</p>
        
        <p>You can now:</p>
        <ul>
          <li>Access your institute dashboard</li>
          <li>Add faculty members</li>
          <li>Manage student accounts</li>
          <li>Create and manage courses</li>
          <li>Track academic progress</li>
        </ul>

        <div style="text-align:center;margin:25px 0;">
          <a href="${process.env.FRONTEND_URL}/institute/login" 
            style="background:#059669;color:white;padding:14px 30px;border-radius:6px;
            text-decoration:none;font-size:16px;font-weight:bold;">
            Access Your Dashboard
          </a>
        </div>

        <p>If you have any questions, please contact our support team.</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#6b7280;font-size:12px;">
          EcoQuest - Transforming Education
        </p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"EcoQuest Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log(`✅ Approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

// ===============================
// Test Email Connection
// ===============================
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};
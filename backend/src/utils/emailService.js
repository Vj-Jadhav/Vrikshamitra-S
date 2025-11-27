import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendOTPEmail = async (email, otp, role) => {
  const subject = role === 'student' 
    ? "Your Student Account Password Setup OTP - EcoQuest"
    : "Your Faculty Account Password Setup OTP - EcoQuest";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">EcoQuest</h2>
      <h3>Password Setup Verification</h3>
      <p>Dear ${role === 'student' ? 'Student' : 'Faculty Member'},</p>
      <p>You are setting up your password for the first time. Use the OTP below to verify your email address:</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; margin: 20px 0;">
        <h1 style="margin: 0; color: #059669; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
      </div>
      
      <p><strong>This OTP will expire in 15 minutes.</strong></p>
      
      <p>If you didn't request this OTP, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message from EcoQuest Environmental Learning Platform.
      </p>
    </div>
  `;

  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"EcoQuest" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });
    
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};
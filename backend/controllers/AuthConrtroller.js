import prisma from '../config/db.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {generateOtp,sendOtp } from '../utils/sendOtp.js';
import { generateToken, tokenVerify } from '../utils/jwtToken.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map();

/**
 * Register a new user (Passenger or Driver)
 * Sends OTP to user's email after registration
 */
export const register = async (req, res) => {
    const { name, email, password, role, aadharNumber } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      // Check if Aadhar number is provided for verification
      if (!aadharNumber) {
        return res.status(400).json({ error: 'Aadhar number is required for identity verification' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the new user (without verifying email initially)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role === 'DRIVER' ? 'DRIVER' : 'PASSENGER',
          isVerified: false,
          aadharNumber,
          isAadharVerified: false, // Admin will verify this later
        },
      });
  
      // Generate OTP and set expiration
      const otp = generateOtp();
      otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });  // Expiry in 10 minutes
  
      // Send OTP to user's email
      await sendOtp(email, otp);
  
      // Respond with success message
      res.status(201).json({
        message: 'User registered successfully. OTP sent to email. Your account is pending Aadhar verification.',
        user: { id: user.id, email: user.email },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  };

/**
 * Login a verified user
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role,name:user.name,email:user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Send OTP to user's email (for resending if needed)
 */
export const sendOtpToUser = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = generateOtp();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendOtp(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('OTP Error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const entry = otpStore.get(email);
  if (!entry) return res.status(400).json({ error: 'No OTP found for this email' });

  const { otp: storedOtp, expiresAt } = entry;

  if (Date.now() > expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP has expired' });
  }

  if (otp !== storedOtp) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  otpStore.delete(email);

  try {
    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    // Generate JWT token after successful verification
    const token = jwt.sign(
      {
        userId: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'OTP verified successfully. Email is now verified.',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};

/**
 * Handle forgot password request
 * Generates a reset token and sends email
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token with user info and purpose
    const resetToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      purpose: 'password-reset'
    }, '1h'); // Token expires in 1 hour

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({ message: "Failed to send password reset email" });
    }

    // Don't return the token in the response for security
    return res.status(200).json({ 
      message: "Password reset instructions sent to your email",
      status: 'success'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: "Error processing password reset request" });
  }
};

/**
 * Reset user password
 * Validates token and updates password
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    // Verify token
    const decoded = tokenVerify(token);
    
    // Handle specific failure cases
    if (!decoded) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }
    
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ 
      message: "Password reset successfully",
      status: 'success'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: "Error resetting password" });
  }
};


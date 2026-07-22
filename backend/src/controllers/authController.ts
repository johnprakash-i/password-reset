import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { sendPasswordResetEmail } from '../services/emailService';
import {
  generateResetToken,
  getResetTokenExpiry,
  hashResetToken,
} from '../utils/token';
import { env } from '../config/env';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Forgot password:
 * 1. Verify the email exists
 * 2. Generate a random token, store its hash + expiry in MongoDB
 * 3. Email the raw token via a reset link
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No account found with that email address', 404);
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = getResetTokenExpiry();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetToken,
      });
    } catch (mailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save({ validateBeforeSave: false });
      console.error('Failed to send reset email:', mailError);
      throw new AppError('Unable to send password reset email. Please try again later.', 502);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
      data: {
        expiresInMinutes: env.RESET_TOKEN_EXPIRY_MINUTES,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Validates a reset token from the email link before showing the form.
 * Returns an error if the token is invalid or expired.
 */
export async function verifyResetToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError('Reset token is required', 400);
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new AppError(
        'This password reset link is invalid or has expired. Please request a new one.',
        400,
      );
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password:
 * - Match token against the stored hash
 * - Reject if expired
 * - Save the new password and clear the token fields
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token, password } = req.body;

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new AppError(
        'This password reset link is invalid or has expired. Please request a new one.',
        400,
      );
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
}

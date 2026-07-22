import crypto from 'crypto';
import { env } from '../config/env';

/** Generates a cryptographically secure random token for password reset links. */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Hashes a reset token before storing it in the database. */
export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Returns the expiry Date for a newly issued reset token. */
export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + env.RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
}

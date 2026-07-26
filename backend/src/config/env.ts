import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_URL: z
    .string()
    .url('CLIENT_URL must be a valid URL')
    .transform((value) => value.replace(/\/$/, '')),
  RESET_TOKEN_EXPIRY_MINUTES: z.coerce.number().positive().default(15),

  // Resend (preferred in production — HTTP API, works on Render free tier)
  RESEND_API_KEY: z.string().optional(),

  // SMTP fallback (optional when Resend is configured)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  EMAIL_FROM: z.string().min(1).default('SecureReset <onboarding@resend.dev>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

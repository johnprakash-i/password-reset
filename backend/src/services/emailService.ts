import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporterPromise: Promise<Transporter> | null = null;

function looksLikePlaceholderSmtp(): boolean {
  const user = env.SMTP_USER.toLowerCase();
  const pass = env.SMTP_PASS.toLowerCase();
  return (
    user.includes('your-email') ||
    pass.includes('your-app-password') ||
    pass === 'password' ||
    pass === 'changeme'
  );
}

async function createTransporter(): Promise<Transporter> {
  // In development, fall back to Ethereal so the flow is testable without real SMTP.
  if (env.NODE_ENV === 'development' && looksLikePlaceholderSmtp()) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Using Ethereal test SMTP account for development email delivery');
    console.log(`Ethereal user: ${testAccount.user}`);

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

async function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

export async function verifyMailTransport(): Promise<void> {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    console.log('Email transport verified successfully');
  } catch (error) {
    console.warn(
      'Email transport verification failed. Password reset emails may not send until SMTP is configured correctly.',
    );
    console.warn(error);
  }
}

interface SendPasswordResetEmailOptions {
  to: string;
  name: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: SendPasswordResetEmailOptions): Promise<void> {
  const transporter = await getTransporter();
  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;
  const expiryMinutes = env.RESET_TOKEN_EXPIRY_MINUTES;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #0f766e;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset the password for your account.</p>
      <p>Click the button below to choose a new password. This link expires in <strong>${expiryMinutes} minutes</strong>.</p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}"
           style="background:#0f766e;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #334155;">${resetUrl}</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: env.EMAIL_FROM.includes('your-email')
      ? '"SecureReset" <noreply@securereset.dev>'
      : env.EMAIL_FROM,
    to,
    subject: 'Reset your password',
    text: `Hello ${name},\n\nReset your password using this link (expires in ${expiryMinutes} minutes):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Password reset email preview: ${previewUrl}`);
  }
}

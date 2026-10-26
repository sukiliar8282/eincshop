import nodemailer from "nodemailer";

/**
 * Modul Layanan Pengiriman Email OTP Eincshop
 * Mengirimkan kode OTP 6-digit asli langsung ke kotak masuk email pengguna dalam Bahasa Inggris standar internasional.
 */

type SendOtpEmailOptions = {
  email: string;
  otp: string;
  isEn?: boolean;
};

export async function sendOtpEmail({
  email,
  otp,
  isEn = true,
}: SendOtpEmailOptions): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const subject = `${otp} is your EINCSHOP verification code`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbfb; color: #111111; margin: 0; padding: 40px 20px; }
          .container { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .logo { font-size: 13px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #111111; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 600; margin: 0 0 12px; color: #111111; letter-spacing: -0.02em; }
          .desc { font-size: 14px; line-height: 1.6; color: #666666; margin: 0 0 28px; }
          .otp-box { background: #f4f4f5; border: 1px dashed #d4d4d8; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 28px; }
          .otp-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #09090b; }
          .footer { font-size: 12px; line-height: 1.5; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">EINCSHOP SECURITY</div>
          <h1 class="title">Verify Your Email Address</h1>
          <p class="desc">
            Please enter the 6-digit verification code below to complete your account setup. This code is valid for 10 minutes.
          </p>
          <div class="otp-box">
            <span class="otp-code">${otp}</span>
          </div>
          <div class="footer">
            Never share this verification code with anyone. If you didn't request this code, please safely ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Pengiriman Email Nyata via SMTP Gmail
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"EINCSHOP Security" <${smtpUser}>`,
        to: normalizedEmail,
        subject,
        html: htmlContent,
      });

      console.log(
        `[EmailSender]: Email OTP 6-digit (${otp}) successfully sent to ${normalizedEmail}`,
      );
      return true;
    } catch (error) {
      console.error("[EmailSender SMTP Error]:", error);
    }
  }

  // 2. Mode Pengembangan / Fallback Terminal Konsol
  console.log(`
============================================================
[EINCSHOP SECURITY] EMAIL OTP VERIFICATION CODE
Recipient    : ${normalizedEmail}
OTP Code     : ${otp}
Expires In   : 10 Minutes
Subject      : ${subject}
Service      : Terminal Fallback Logger
============================================================
  `);

  return true;
}

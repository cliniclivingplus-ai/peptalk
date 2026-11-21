import { Resend } from 'resend';

export interface SendOtpResult {
  success: boolean;
  simulated?: boolean;
  otp?: string;
  error?: string;
}

/**
 * Send a 6-digit OTP email to the user's @cliniclivingplus.com address.
 * Integrates with Resend on Vercel, with automatic simulated fallback if API key is not yet set.
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  purpose: 'signup' | 'reset'
): Promise<SendOtpResult> {
  const normalizedEmail = toEmail.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'ClinicLivingPlus Security <onboarding@resend.dev>';

  const isSignup = purpose === 'signup';
  const actionTitle = isSignup ? 'Activate Your Clinic Account' : 'Password Reset Verification';
  const actionDescription = isSignup
    ? 'You are setting up your personal password for the ClinicLivingPlus Clinical Portal.'
    : 'A password reset was requested for your ClinicLivingPlus Clinical Portal account.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClinicLivingPlus Security Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6fd; margin: 0; padding: 24px; color: #1e202a; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid rgba(127, 102, 255, 0.18); overflow: hidden; box-shadow: 0 10px 35px -5px rgba(127, 102, 255, 0.12); }
          .header-bar { height: 6px; width: 100%; background: linear-gradient(90deg, #7F66FF 0%, #583EDB 50%, #00D2B4 100%); }
          .content { padding: 36px 32px; }
          .badge { display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #7F66FF; background: #f1eefe; border-radius: 9999px; margin-bottom: 14px; }
          h1 { font-size: 22px; font-weight: 800; color: #111116; margin: 0 0 10px 0; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #4a4d5e; margin: 0 0 20px 0; }
          .code-box { background: #f8f7fe; border: 1.5px dashed #7F66FF; border-radius: 14px; padding: 20px; text-align: center; margin: 26px 0; }
          .code-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6949d7; margin-bottom: 6px; }
          .code { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #583EDB; }
          .notice { font-size: 12px; color: #727588; line-height: 1.5; border-top: 1px solid #ebebf2; padding-top: 18px; margin-top: 24px; }
          .footer { font-size: 11px; color: #9c9eb1; text-align: center; padding: 18px 24px; background: #fafafc; border-top: 1px solid #f0f0f4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-bar"></div>
          <div class="content">
            <div class="badge">ClinicLivingPlus Security</div>
            <h1>${actionTitle}</h1>
            <p>${actionDescription}</p>
            <p>Please enter the following one-time verification code (OTP) in your browser window to verify your <strong>${normalizedEmail}</strong> account:</p>
            
            <div class="code-box">
              <div class="code-title">One-Time Verification Code</div>
              <div class="code">${otpCode}</div>
            </div>

            <p style="font-size: 13px; color: #5c5e70;">⏱️ This code will expire in <strong>10 minutes</strong>. Do not share this security code with anyone.</p>

            <div class="notice">
              <strong>Need help or didn't request this?</strong><br>
              If you did not initiate this request from the ClinicLivingPlus portal, you can safely ignore this email or contact your clinic administrator.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ClinicLivingPlus · PepTalk Clinical Intelligence Portal
          </div>
        </div>
      </body>
    </html>
  `;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const res = await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: `[ClinicLivingPlus] Your Security Code: ${otpCode}`,
        html: htmlContent,
      });

      if (res.error) {
        console.error('[Resend Error]', res.error);
        return { success: false, error: res.error.message };
      }

      console.log(`[Resend Success] Sent OTP email to ${normalizedEmail}`);
      return { success: true };
    } catch (err: any) {
      console.error('[Resend Exception]', err);
      return { success: false, error: err.message || 'Failed to dispatch email via Resend' };
    }
  }

  // Simulated fallback when RESEND_API_KEY is not yet populated
  console.log(`=======================================================`);
  console.log(`[ClinicLivingPlus Auth] RESEND_API_KEY is not set.`);
  console.log(`[ClinicLivingPlus Auth] SIMULATED OTP for ${normalizedEmail}: ${otpCode}`);
  console.log(`=======================================================`);

  return {
    success: true,
    simulated: true,
    otp: otpCode,
  };
}

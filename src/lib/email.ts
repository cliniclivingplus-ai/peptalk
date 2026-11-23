import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { StaffMember, recordStaffNotification } from './rosterStore';

export interface SendResult {
  success: boolean;
  simulated?: boolean;
  otp?: string;
  error?: string;
  sandboxNotice?: string;
  provider?: 'gmail-smtp' | 'resend' | 'simulated';
}

/**
 * Configure email transport: Prefers Gmail SMTP (zero DNS setup required), falls back to Resend or Simulation
 */
function getEmailTransport() {
  const smtpUser = process.env.SMTP_USER; // e.g. cliniclivingplus.ai@gmail.com
  const smtpPass = process.env.SMTP_PASS; // 16-char Google App Password
  const resendKey = process.env.RESEND_API_KEY;

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass.replace(/\s+/g, ''), // Strip spaces if copied with spaces
      },
    });
    return { type: 'smtp' as const, transporter, fromEmail: `ClinicLivingPlus Access <${smtpUser}>` };
  }

  if (resendKey) {
    const resend = new Resend(resendKey);
    const fromEmail = process.env.EMAIL_FROM || 'ClinicLivingPlus Security <onboarding@resend.dev>';
    return { type: 'resend' as const, resend, fromEmail };
  }

  return { type: 'simulated' as const };
}

/**
 * Send an individual weekly access password email to a staff member
 */
export async function sendWeeklyPasswordNotification(
  staff: StaffMember,
  weeklyPassword: string,
  weekLabel: string,
  expiresAt: string
): Promise<SendResult> {
  const transport = getEmailTransport();
  const staffName = staff.name || 'Doctor';
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cliniclivingplus-ai-peptalk.vercel.app';
  const expiresFormatted = new Date(expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Clinical Access Key</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6fd; margin: 0; padding: 24px; color: #1e202a; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid rgba(127, 102, 255, 0.18); overflow: hidden; box-shadow: 0 10px 35px -5px rgba(127, 102, 255, 0.12); }
          .header-bar { height: 6px; width: 100%; background: linear-gradient(90deg, #7F66FF 0%, #583EDB 50%, #00D2B4 100%); }
          .content { padding: 36px 32px; }
          .badge { display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #7F66FF; background: #f1eefe; border-radius: 9999px; margin-bottom: 14px; }
          h1 { font-size: 22px; font-weight: 800; color: #111116; margin: 0 0 10px 0; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #4a4d5e; margin: 0 0 16px 0; }
          .pass-box { background: #f8f7fe; border: 1.5px solid #7F66FF; border-radius: 14px; padding: 22px 20px; text-align: center; margin: 24px 0; box-shadow: 0 4px 16px rgba(127, 102, 255, 0.08); }
          .pass-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6949d7; margin-bottom: 8px; }
          .passcode { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #583EDB; word-break: break-all; }
          .btn-container { text-align: center; margin: 26px 0 10px 0; }
          .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #7F66FF 0%, #583EDB 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 10px; box-shadow: 0 6px 18px rgba(127, 102, 255, 0.35); }
          .meta { font-size: 12px; color: #6b7280; background: #f9fafb; padding: 12px 16px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 20px 0; line-height: 1.5; }
          .footer { font-size: 11px; color: #9c9eb1; text-align: center; padding: 18px 24px; background: #fafafc; border-top: 1px solid #f0f0f4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-bar"></div>
          <div class="content">
            <div class="badge">Weekly Security Update</div>
            <h1>Your Weekly Access Key</h1>
            <p>Hello <strong>${staffName}</strong>,</p>
            <p>Your access passcode for the <strong>ClinicLivingPlus Clinical Portal (PepTalk)</strong> has been updated for <strong>${weekLabel}</strong>.</p>
            
            <div class="pass-box">
              <div class="pass-label">Active Passcode for This Week</div>
              <div class="passcode">${weeklyPassword}</div>
            </div>

            <div class="btn-container">
              <a href="${portalUrl}" class="btn">Open PepTalk Portal &rarr;</a>
            </div>

            <div class="meta">
              <strong>Authorized User:</strong> ${staff.email}<br>
              <strong>Valid Until:</strong> ${expiresFormatted}<br>
              <em>Note: Previous week passwords have now expired.</em>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ClinicLivingPlus · PepTalk Clinical Intelligence Platform
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Send via Gmail SMTP
  if (transport.type === 'smtp') {
    try {
      await transport.transporter.sendMail({
        from: transport.fromEmail,
        to: staff.email,
        subject: `[PepTalk · ClinicLivingPlus] Your Weekly Clinical Access Password (${weekLabel})`,
        html: htmlContent,
      });
      console.log(`[SMTP Success] Dispatched weekly password to ${staff.email}`);
      await recordStaffNotification(staff.email);
      return { success: true, provider: 'gmail-smtp' };
    } catch (err: any) {
      console.error(`[SMTP Error] Failed to send to ${staff.email}:`, err);
      return { success: false, error: err.message, provider: 'gmail-smtp' };
    }
  }

  // 2. Send via Resend
  if (transport.type === 'resend') {
    try {
      const res = await transport.resend.emails.send({
        from: transport.fromEmail,
        to: staff.email,
        subject: `[PepTalk · ClinicLivingPlus] Your Weekly Clinical Access Password (${weekLabel})`,
        html: htmlContent,
      });

      if (res.error) {
        console.warn(`[Resend Error] ${res.error.message}`);
        return { success: false, error: res.error.message, provider: 'resend' };
      }

      await recordStaffNotification(staff.email);
      return { success: true, provider: 'resend' };
    } catch (err: any) {
      return { success: false, error: err.message, provider: 'resend' };
    }
  }

  // 3. Simulated Fallback (when SMTP and Resend are not yet configured)
  console.log(`=======================================================`);
  console.log(`[WEEKLY ACCESS NOTIFICATION SIMULATED]`);
  console.log(`Recipient: ${staff.email} (${staff.name})`);
  console.log(`Password: ${weeklyPassword}`);
  console.log(`Week: ${weekLabel}`);
  console.log(`=======================================================`);

  await recordStaffNotification(staff.email);
  return { success: true, simulated: true, provider: 'simulated' };
}

/**
 * Send weekly password broadcast to all active staff members.
 * Sends each doctor their own personalized weekly password!
 */
export async function sendWeeklyPasswordBroadcast(
  staffList: StaffMember[],
  weeklyPassword?: string,
  weekLabel?: string,
  expiresAt?: string
): Promise<{ totalSent: number; totalFailed: number; simulated: boolean }> {
  let totalSent = 0;
  let totalFailed = 0;
  let isSimulated = false;

  const activeStaff = staffList.filter((s) => s.status === 'active');

  for (const staff of activeStaff) {
    const passwordToSend = staff.currentPassword || weeklyPassword || '';
    const result = await sendWeeklyPasswordNotification(
      staff,
      passwordToSend,
      weekLabel || 'Current Week',
      expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
    if (result.success) {
      totalSent++;
      if (result.simulated) isSimulated = true;
    } else {
      totalFailed++;
    }
  }

  return { totalSent, totalFailed, simulated: isSimulated };
}

/**
 * Send an Executive Director's Summary Email to the clinic administrator (cliniclivingplus.ai@gmail.com)
 */
export async function sendAdminWeeklySummaryEmail(
  adminEmail: string,
  newPassword: string,
  weekLabel: string,
  notifiedStaff: StaffMember[],
  expiresAt: string
): Promise<SendResult> {
  const transport = getEmailTransport();
  const targetEmail = adminEmail || process.env.SMTP_USER || 'cliniclivingplus.ai@gmail.com';
  const expiresFormatted = new Date(expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const staffRows = notifiedStaff
    .map(
      (s) =>
        `<tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 10px; font-weight: 700; color: #111827;">${s.name}</td>
          <td style="padding: 8px 10px; color: #4b5563; font-size: 12px;">${s.email}</td>
          <td style="padding: 8px 10px; font-family: monospace; font-weight: 800; color: #583EDB; font-size: 13px;">${s.currentPassword || newPassword}</td>
        </tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Director's Weekly Password Summary</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f6fd; margin: 0; padding: 24px; color: #1e202a; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1.5px solid rgba(127, 102, 255, 0.25); overflow: hidden; box-shadow: 0 12px 40px -6px rgba(127, 102, 255, 0.15); }
          .header-bar { height: 6px; width: 100%; background: linear-gradient(90deg, #7F66FF 0%, #583EDB 50%, #00D2B4 100%); }
          .content { padding: 36px 32px; }
          .badge { display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #7F66FF; background: #f1eefe; border-radius: 9999px; margin-bottom: 14px; }
          h1 { font-size: 22px; font-weight: 800; color: #111116; margin: 0 0 10px 0; }
          p { font-size: 14px; line-height: 1.6; color: #4a4d5e; margin: 0 0 16px 0; }
          .table-container { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
          th { background: #f3f4f6; padding: 9px 10px; font-weight: 700; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
          .footer { font-size: 11px; color: #9c9eb1; text-align: center; padding: 18px 24px; background: #fafafc; border-top: 1px solid #f0f0f4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-bar"></div>
          <div class="content">
            <div class="badge">Director Executive Summary</div>
            <h1>Automated Weekly Rotation Complete</h1>
            <p>The weekly credential rotation has finished automatically for <strong>${weekLabel}</strong>. Each doctor has been issued their own distinct active password:</p>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Email</th>
                    <th>This Week's Password</th>
                  </tr>
                </thead>
                <tbody>
                  ${staffRows}
                </tbody>
              </table>
            </div>

            <p style="font-size: 13px; color: #6b7280;">
              <strong>Valid Period:</strong> Active now through ${expiresFormatted}.<br>
              <strong>Next Automated Rotation:</strong> Next Sunday at 11:30 PM IST.
            </p>
          </div>
          <div class="footer">
            ClinicLivingPlus Administration · PepTalk Automated Credential Governance
          </div>
        </div>
      </body>
    </html>
  `;

  if (transport.type === 'smtp') {
    try {
      await transport.transporter.sendMail({
        from: transport.fromEmail,
        to: targetEmail,
        subject: `[PepTalk · Director Summary] Weekly Passcode Rotated: ${newPassword} (${weekLabel})`,
        html: htmlContent,
      });
      console.log(`[SMTP Success] Sent Director Summary to ${targetEmail}`);
      return { success: true, provider: 'gmail-smtp' };
    } catch (err: any) {
      console.error(`[SMTP Error] Failed to send Director Summary to ${targetEmail}:`, err);
      return { success: false, error: err.message, provider: 'gmail-smtp' };
    }
  }

  if (transport.type === 'resend') {
    try {
      await transport.resend.emails.send({
        from: transport.fromEmail,
        to: targetEmail,
        subject: `[PepTalk · Director Summary] Weekly Passcode Rotated: ${newPassword} (${weekLabel})`,
        html: htmlContent,
      });
      return { success: true, provider: 'resend' };
    } catch (err: any) {
      return { success: false, error: err.message, provider: 'resend' };
    }
  }

  console.log(`=======================================================`);
  console.log(`[DIRECTOR SUMMARY SIMULATED] Sent to: ${targetEmail}`);
  console.log(`Password: ${newPassword} (${weekLabel})`);
  console.log(`Staff Notified: ${notifiedStaff.map((s) => s.email).join(', ')}`);
  console.log(`=======================================================`);

  return { success: true, simulated: true, provider: 'simulated' };
}

/**
 * Send OTP verification email (preserved for OTP actions)
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  purpose: 'signup' | 'reset'
): Promise<SendResult> {
  const normalizedEmail = toEmail.trim().toLowerCase();
  const transport = getEmailTransport();
  const isSignup = purpose === 'signup';
  const actionTitle = isSignup ? 'Activate Your Clinic Account' : 'Password Reset Verification';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>ClinicLivingPlus Security Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f6fd; padding: 24px; color: #1e202a; }
          .box { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #7F66FF33; text-align: center; }
          .code { font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #583EDB; padding: 16px; background: #f8f7fe; border-radius: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>${actionTitle}</h2>
          <p>Your 6-digit one-time passcode for <strong>${normalizedEmail}</strong>:</p>
          <div class="code">${otpCode}</div>
          <p style="font-size: 12px; color: #6b7280;">Valid for 10 minutes. If you did not request this code, please contact your administrator.</p>
        </div>
      </body>
    </html>
  `;

  if (transport.type === 'smtp') {
    try {
      await transport.transporter.sendMail({
        from: transport.fromEmail,
        to: normalizedEmail,
        subject: `[ClinicLivingPlus] Your Security Code: ${otpCode}`,
        html: htmlContent,
      });
      return { success: true, provider: 'gmail-smtp' };
    } catch (err: any) {
      return { success: false, error: err.message, provider: 'gmail-smtp' };
    }
  }

  if (transport.type === 'resend') {
    try {
      const res = await transport.resend.emails.send({
        from: transport.fromEmail,
        to: normalizedEmail,
        subject: `[ClinicLivingPlus] Your Security Code: ${otpCode}`,
        html: htmlContent,
      });
      if (res.error) return { success: false, error: res.error.message, provider: 'resend' };
      return { success: true, provider: 'resend' };
    } catch (err: any) {
      return { success: false, error: err.message, provider: 'resend' };
    }
  }

  console.log(`[SIMULATED OTP] For ${normalizedEmail}: ${otpCode}`);
  return { success: true, simulated: true, otp: otpCode, provider: 'simulated' };
}

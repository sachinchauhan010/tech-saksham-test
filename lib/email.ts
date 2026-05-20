import nodemailer from 'nodemailer';
import crypto from 'crypto';

// SINGLETON TRANSPORTER
let _transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (_transporter) return _transporter;

  // PRODUCTION
  if (
    process.env.SMTP_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return _transporter;
  }

  // DEVELOPMENT — dynamic Ethereal account
  const testAccount = await nodemailer.createTestAccount();

  _transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log('📬 Ethereal test account created:', testAccount.user);

  return _transporter;
};

// VALIDATE EMAIL_FROM IN PRODUCTION
const getSenderAddress = (): string => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.EMAIL_FROM) {
      throw new Error(
        'EMAIL_FROM environment variable is required in production'
      );
    }
    return `"Tech Saksham" <${process.env.EMAIL_FROM}>`;
  }

  return `"Tech Saksham" <${process.env.EMAIL_FROM || 'noreply@nicsi.gov.in'}>`;
};

// HASH OTP BEFORE STORING (HMAC-SHA256)
export const hashOTP = (otp: string): string => {
  const secret = process.env.OTP_SECRET || 'fallback-secret-change-in-production';
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
};

// VERIFY OTP AGAINST STORED HASH
export const verifyOTPHash = (otp: string, hash: string): boolean => {
  return hashOTP(otp) === hash;
};

// SEND EMAIL
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) => {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: getSenderAddress(),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email sent successfully!');
      console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('📨 Message ID:', info.messageId);
    } else {
      console.log('✅ Email sent to:', options.to);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send email',
    };
  }
};

// OTP EMAIL TEMPLATE
export const generateOTPEmail = (
  email: string,
  otp: string,
  purpose: 'verification' | 'password_reset'
) => {
  const isVerification = purpose === 'verification';

  const subject = isVerification
    ? 'Tech Saksham - Email Verification'
    : 'Tech Saksham - Password Reset';

  // FORMAT OTP AS SPACED DIGITS FOR TEXT VERSION
  const otpSpaced = otp.split('').join(' ');

  // RENDER OTP AS INDIVIDUAL DIGIT BOXES
  const otpDigitBoxes = otp
    .split('')
    .map(
      (digit) => `
        <td style="padding: 0 4px;">
          <div style="
            width: 44px;
            height: 52px;
            background-color: #ffffff;
            border: 1.5px solid ${isVerification ? '#1d5fc4' : '#c53030'};
            border-radius: 8px;
            text-align: center;
            line-height: 52px;
            font-size: 24px;
            font-weight: 600;
            color: ${isVerification ? '#1d5fc4' : '#c53030'};
            font-family: 'Courier New', Courier, monospace;
            display: inline-block;
          ">${digit}</div>
        </td>`
    )
    .join('');

  const accentColor = isVerification ? '#1d5fc4' : '#c53030';
  const lightBg = isVerification ? '#eef4fd' : '#fff5f5';
  const headerTitle = isVerification ? 'Email Verification' : 'Password Reset';

  const warningText = isVerification
    ? "If you didn't request this verification, you can safely ignore this email."
    : "If you didn't request a password reset, please secure your account immediately.";

  const bodyText = isVerification
    ? 'Use the code below to complete your registration or login. Do not share this with anyone.'
    : 'Use the code below to reset your password. Do not share this with anyone.';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- HEADER -->
          <tr>
            <td style="background-color: ${accentColor}; padding: 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  // <td style="padding-right: 12px; vertical-align: middle;">
                  //   <div style="
                  //     width: 36px;
                  //     height: 36px;
                  //     background-color: rgba(255,255,255,0.2);
                  //     border-radius: 8px;
                  //     display: flex;
                  //     align-items: center;
                  //     justify-content: center;
                  //   ">
                  //     <img src="https://img.icons8.com/ios/24/ffffff/shield--v1.png" width="20" height="20" alt="" style="display: block;" />
                  //   </div>
                  // </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">${headerTitle}</p>
                    <p style="margin: 2px 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">Tech Saksham · Government Digital Platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 32px;">

              <p style="margin: 0 0 6px; font-size: 15px; color: #111827;">Hi there,</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                ${bodyText} This code is valid for <strong style="color: #111827;">10 minutes</strong>.
              </p>

              <!-- OTP BLOCK -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color: ${lightBg}; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 16px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em;">
                      Your ${isVerification ? 'verification' : 'reset'} code
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        ${otpDigitBoxes}
                      </tr>
                    </table>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
                      ⏱ Expires in 10 minutes
                    </p>
                  </td>
                </tr>
              </table>

              <!-- SECURITY WARNING -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color: #fffbeb; border-radius: 8px; border: 1px solid #fde68a; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                      ⚠️ <strong>Never share this code.</strong> Tech Saksham will never ask for your OTP over phone, email, or chat.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #f3f4f6; padding-top: 20px;">

                    <!-- META ROWS -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">
                          📧 Sent to <strong style="color: #111827;">${email}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">
                          🔒 Purpose:
                          <span style="
                            display: inline-block;
                            font-size: 11px;
                            padding: 2px 8px;
                            border-radius: 99px;
                            background-color: ${lightBg};
                            color: ${accentColor};
                            font-weight: 600;
                            margin-left: 4px;
                          ">${isVerification ? 'Verification' : 'Password Reset'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0 0; font-size: 13px; color: #9ca3af;">
                          ℹ️ ${warningText}
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="border-top: 1px solid #f3f4f6; padding: 14px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 12px; color: #9ca3af;">© 2024 Tech Saksham</td>
                  <td style="font-size: 12px; color: #9ca3af; text-align: right;">noreply@nicsi.gov.in</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const text = isVerification
    ? `Your Tech Saksham verification code is: ${otpSpaced}\n\nThis code will expire in 10 minutes.\nNever share this code with anyone.\n\n${warningText}`
    : `Your Tech Saksham password reset code is: ${otpSpaced}\n\nThis code will expire in 10 minutes.\nNever share this code with anyone.\n\n${warningText}`;

  return { subject, html, text };
};
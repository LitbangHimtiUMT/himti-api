import nodemailer from "nodemailer";
import { environment } from "../libs";

interface SendMailOption {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export const messageOtp = (name: string, otp: number) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification - HIMTI UMT</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 600px;">

              <!-- Header -->
              <tr>
                <td style="background-color: #0c4a6e; padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    HIMTI UMT
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 500;">
                    Himpunan Mahasiswa Teknik Informatika
                  </p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                    Halo, ${name}!
                  </h2>
                  <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Kami menerima permintaan untuk verifikasi akun Anda. Gunakan kode OTP berikut untuk melanjutkan:
                  </p>

                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 24px 0;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 3px; display: inline-block;">
                          <div style="background-color: #ffffff; border-radius: 10px; padding: 20px 40px;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                              Kode OTP Anda
                            </p>
                            <p style="margin: 8px 0 0 0; color: #667eea; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                              ${otp}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiry Info -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
                    <tr>
                      <td>
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                          <strong>Penting:</strong> Kode OTP ini berlaku selama <strong>3 menit</strong>. Segera gunakan untuk verifikasi akun Anda.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Security Warning -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fee2e2; border-radius: 8px; padding: 16px; margin-top: 16px;">
                    <tr>
                      <td>
                        <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                          <strong>Keamanan:</strong> Jangan pernah membagikan kode OTP ini kepada siapapun, termasuk staf HIMTI. Kami tidak akan pernah meminta kode OTP Anda.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Jika Anda tidak meminta kode verifikasi ini, abaikan email ini atau hubungi kami jika ada yang mencurigakan.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                    HIMTI UMT
                  </p>
                  <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                    Himpunan Mahasiswa Teknik Informatika<br/>
                    Universitas Muhammadiyah Tangerang
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} HIMTI UMT. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const transporter = nodemailer.createTransport({
  host: environment.SMTP_HOST,
  port: Number(environment.SMTP_PORT),
  secure: false,
  auth: {
    user: environment.SMTP_LOGIN,
    pass: environment.SMTP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  console.log({ error, success });
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send messages!");
  }
});

export const sendMail = async (data: SendMailOption) => {
  console.log(`Success send email to ${data.to}`);
  return await transporter.sendMail({
    to: data.to,
    from: environment.EMAIL_SENDER,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });
};
export const sendOtp = async (to: string, name: string, otp: number) => {
  return sendMail({
    to,
    subject: "HIMTI UMT Code Verification",
    text: `Your OTP Code Verification is ${otp}`,
    html: messageOtp(name, otp),
  });
};

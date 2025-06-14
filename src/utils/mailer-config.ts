import nodemailer, { type TransportOptions } from "nodemailer";
import { environment } from "../libs";

interface SendMailOption {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export const messageOtp = (name: string, otp: number) => {
  return `
        <p>Hi ${name},</p>
        <br/>
        <p>Please use the following One Time Password (OTP) to access the form: <span style="color: #059df0">${otp}</span>. Don't share this OTP with anyone.</p>`;
};

export const transporter = nodemailer.createTransport({
  host: environment.SMTP_HOST,
  port: environment.SMTP_PORT,
  secure: false,
  auth: {
    user: environment.SMTP_LOGIN,
    pass: environment.SMTP_PASSWORD,
  },
} as TransportOptions);

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

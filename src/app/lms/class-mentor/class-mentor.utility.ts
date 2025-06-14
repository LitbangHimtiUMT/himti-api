import { sendMail } from "../../../utils/mailer-config";

interface SendInvitation {
  className: string;
  inviter: string;
  recipient: string;
}

export const sendMailInvitationMentor = async (to: string, data: SendInvitation) => {
  return await sendMail({
    to,
    subject: "Invitation Mentor",
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Invitation to Be a Mentor</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
        padding: 32px;
      }

      h1 {
        font-size: 20px;
        color: #111827;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .btn {
        display: inline-block;
        padding: 12px 24px;
        background-color: #3F51B5;
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 12px;
      }

      .footer {
        margin-top: 32px;
        font-size: 12px;
        color: #9ca3af;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>You're Invited to Be a Mentor</h1>
      <p>Hi <strong>${data.recipient}</strong>,</p>

      <p>
        <strong>${data.inviter}</strong> has invited you to become a mentor for the class:
        <strong>${data.className}</strong>.
      </p>

      <p>
        As a mentor, you will be able to guide participants, contribute learning
        materials, and collaborate with other instructors.
      </p>

      <p>If you weren't expecting this email, feel free to ignore it.</p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} HIMTI LMS — All rights reserved.
      </div>
    </div>
  </body>
</html>
`,
  });
};

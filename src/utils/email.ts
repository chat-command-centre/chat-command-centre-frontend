import nodemailer from "nodemailer";
import { env } from "~/env";

// Use Nodemailer's createTestAccount instead of hardcoding test credentials
const testAccount = await nodemailer.createTestAccount();

// Override environment variables with test account
const testEmailConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
};

// Use test configuration if in development, otherwise use environment variables
export const transportConfig =
  env.EMAIL_SERVER_USER && env.EMAIL_SERVER_PASSWORD
    ? testEmailConfig
    : {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      };

const transporter = nodemailer.createTransport(transportConfig);

// if (env.EMAIL_SERVER_USER && env.EMAIL_SERVER_PASSWORD) {
//   console.log("Using test email configuration");
//   console.log("Test account credentials:", testAccount);

//   // Send a test email
//   await transporter
//     .sendMail({
//       from: testAccount.user,
//       to: "jacobfv123@gmail.com",
//       subject: "Test Email from Development Environment",
//       html: "<p>This is a test email sent from the development environment.</p>",
//     })
//     .then((info) => {
//       console.log(
//         "Test email sent. Preview URL: %s",
//         nodemailer.getTestMessageUrl(info),
//       );
//     })
//     .catch((error) => {
//       console.error("Error sending test email:", error);
//     });

//   console.log("Test email sent");
// }

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const messageInfo = await transporter.sendMail({
    from: transportConfig.auth.user,
    to,
    subject,
    html,
  });
  console.log("Message sent: %s", messageInfo.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(messageInfo));
  return messageInfo.messageId;
}

import nodemailer from "nodemailer";
import { ServiceError } from "./errors.js";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASSWORD,
    },
    secure: process.env.NODE_ENV === "production" ? true : false,
  });
}

async function send(mailOptions) {
  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ServiceError({
      message: "Não foi possível enviar o email.",
      action: "Verifique se o service de email está disponível.",
      cause: error,
      context: mailOptions,
    });
  }
}

const email = {
  send,
};

export default email;

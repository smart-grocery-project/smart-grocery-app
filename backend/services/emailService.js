import nodemailer from "nodemailer";

// Uses a Gmail account + App Password (set EMAIL_USER and EMAIL_PASS in env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetCodeEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"Smart Grocery" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Smart Grocery password reset code",
    text: `Your password reset code is ${code}. It expires in 15 minutes.`,
    html: `
      <p>You requested to reset your Smart Grocery password.</p>
      <p>Your reset code is:</p>
      <h2 style="letter-spacing:4px;">${code}</h2>
      <p>This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};

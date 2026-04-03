const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: `"BookClub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "BookClub verification code",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verification code</h2>
        <p>Your code:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>This code is valid for 15 minutes.</p>
      </div>
    `,
  });
}

module.exports = sendVerificationEmail;
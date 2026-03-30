const nodemailer = require('nodemailer');

const sendEmail = async ({ subject, htmlContent }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

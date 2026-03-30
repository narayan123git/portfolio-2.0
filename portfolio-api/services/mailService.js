const nodemailer = require('nodemailer');

let transporter;

const toBoolean = (value) => String(value).toLowerCase() === 'true';

const buildTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const secure =
    process.env.SMTP_SECURE !== undefined ? toBoolean(process.env.SMTP_SECURE) : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const getTransporter = () => {
  if (!transporter) {
    transporter = buildTransporter();
  }

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!mailer || !to || !from) {
    return false;
  }

  await mailer.sendMail({ from, to, subject, text, html });
  return true;
};

module.exports = {
  sendMail,
};
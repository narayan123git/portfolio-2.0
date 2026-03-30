const nodemailer = require('nodemailer');

let cachedTransporter = null;

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const buildTransportConfig = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  if (smtpHost) {
    return {
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE
        ? parseBoolean(process.env.SMTP_SECURE)
        : smtpPort === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport(buildTransportConfig());
  }

  return cachedTransporter;
};

const assertEmailEnv = () => {
  const missingVars = [];

  if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER');
  if (!process.env.EMAIL_PASS) missingVars.push('EMAIL_PASS');
  if (!process.env.RECEIVER_EMAIL) missingVars.push('RECEIVER_EMAIL');

  if (missingVars.length > 0) {
    throw new Error(`Email configuration missing: ${missingVars.join(', ')}`);
  }
};

const sendEmail = async ({ subject, htmlContent }) => {
  assertEmailEnv();

  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject,
    html: htmlContent,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message,
    });
    throw error;
  }
};

module.exports = sendEmail;

const nodemailer = require('nodemailer');

let cachedTransporter = null;

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const getProviderHost = (serviceName = '') => {
  const normalized = String(serviceName).toLowerCase();

  if (normalized === 'gmail' || normalized === 'google') {
    return 'smtp.gmail.com';
  }

  if (normalized === 'outlook' || normalized === 'hotmail') {
    return 'smtp.office365.com';
  }

  if (normalized === 'yahoo') {
    return 'smtp.mail.yahoo.com';
  }

  return '';
};

const buildTransportConfig = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const smtpHost = process.env.SMTP_HOST || getProviderHost(emailService);
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? parseBoolean(process.env.SMTP_SECURE)
    : smtpPort === 465;
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000);
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 10000);
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 20000);

  if (smtpHost) {
    return {
      host: smtpHost,
      port: smtpPort,
      secure,
      connectionTimeout,
      greetingTimeout,
      socketTimeout,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  // Fallback: if provider is unknown and host is not configured.
  return {
    service: emailService,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
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
    const transportConfig = transporter?.options || {};
    console.error('Email send failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message,
      smtpHost: transportConfig.host || transportConfig.service || 'unknown',
      smtpPort: transportConfig.port || 'unknown',
      secure: typeof transportConfig.secure === 'boolean' ? transportConfig.secure : 'unknown',
    });
    throw error;
  }
};

module.exports = sendEmail;

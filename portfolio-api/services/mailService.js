const nodemailer = require('nodemailer');
const dns = require('dns');

let transporter;

const toBoolean = (value) => String(value).toLowerCase() === 'true';

const applyDnsPreference = () => {
  try {
    const mode = process.env.SMTP_DNS_RESULT_ORDER || 'ipv4first';
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder(mode);
    }
  } catch (error) {
    console.warn('Unable to apply SMTP DNS preference:', error.message);
  }
};

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

  const forceIPv4 = process.env.SMTP_FORCE_IPV4 === undefined
    ? true
    : toBoolean(process.env.SMTP_FORCE_IPV4);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    family: forceIPv4 ? 4 : 0,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 30000),
    tls: {
      servername: host,
    },
    auth: {
      user,
      pass,
    },
  });
};

const getTransporter = () => {
  if (!transporter) {
    applyDnsPreference();
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

  try {
    await mailer.sendMail({ from, to, subject, text, html });
    return true;
  } catch (error) {
    const isNetworkError = ['ENETUNREACH', 'ETIMEDOUT', 'ESOCKET', 'ECONNREFUSED'].includes(error.code);

    if (isNetworkError && process.env.SMTP_FORCE_IPV4 === undefined) {
      // Retry once with explicit IPv4 in environments where IPv6 routing is unavailable.
      transporter = null;
      process.env.SMTP_FORCE_IPV4 = 'true';
      const retryTransporter = getTransporter();
      await retryTransporter.sendMail({ from, to, subject, text, html });
      return true;
    }

    throw error;
  }
};

module.exports = {
  sendMail,
};
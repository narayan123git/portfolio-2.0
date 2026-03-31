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

  const config = {
    host,
    port,
    secure,
    family: forceIPv4 ? 4 : 0,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 30000),
    logger: process.env.SMTP_DEBUG === 'true',
    debug: process.env.SMTP_DEBUG === 'true',
    tls: {
      servername: host,
      rejectUnauthorized: false, // For self-signed certs, set to true for production
    },
    auth: {
      user,
      pass,
    },
  };

  return nodemailer.createTransport(config);
};

const getTransporter = () => {
  if (!transporter) {
    applyDnsPreference();
    transporter = buildTransporter();
    
    // Log what was loaded for debugging
    if (transporter) {
      console.log('📧 SMTP Transporter Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? '***' : 'MISSING',
        pass: process.env.SMTP_PASS ? '***' : 'MISSING',
        from: process.env.SMTP_FROM,
        forceIPv4: process.env.SMTP_FORCE_IPV4,
      });
    }
  }

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!mailer || !to || !from) {
    console.error('Mail service misconfigured:', { hailer: !!mailer, to, from });
    return false;
  }

  try {
    const info = await mailer.sendMail({ from, to, subject, text, html });
    console.log('✓ Email sent successfully:', { messageId: info.messageId, to });
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', {
      code: error.code,
      message: error.message,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      to,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
    });

    const isNetworkError = ['ENETUNREACH', 'ETIMEDOUT', 'ESOCKET', 'ECONNREFUSED'].includes(error.code);

    if (isNetworkError && process.env.SMTP_FORCE_IPV4 === undefined) {
      console.log('⚠️ Retrying with explicit IPv4 preference...');
      // Retry once with explicit IPv4 in environments where IPv6 routing is unavailable.
      transporter = null;
      process.env.SMTP_FORCE_IPV4 = 'true';
      const retryTransporter = getTransporter();
      
      try {
        const retryInfo = await retryTransporter.sendMail({ from, to, subject, text, html });
        console.log('✓ Email sent on retry:', { messageId: retryInfo.messageId });
        return true;
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError.message);
        throw retryError;
      }
    }

    throw error;
  }
};

// Test/verify SMTP connectivity
const verifyTransporter = async () => {
  const mailer = getTransporter();

  if (!mailer) {
    throw new Error('Mail service not configured. Missing SMTP_HOST, SMTP_USER, or SMTP_PASS');
  }

  try {
    console.log('🔍 Testing SMTP connection...');
    await mailer.verify();
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? '***' : 'NOT SET',
      pass: process.env.SMTP_PASS ? '***' : 'NOT SET',
      timeout: {
        connection: process.env.SMTP_CONNECTION_TIMEOUT_MS,
        greeting: process.env.SMTP_GREETING_TIMEOUT_MS,
        socket: process.env.SMTP_SOCKET_TIMEOUT_MS,
      },
      ipv4Forced: process.env.SMTP_FORCE_IPV4,
    };
    console.log('✓ SMTP connection verified:', config);
    return { success: true, config };
  } catch (error) {
    console.error('❌ SMTP verification failed:', {
      code: error.code,
      message: error.message,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw error;
  }
};

module.exports = {
  sendMail,
  verifyTransporter,
};
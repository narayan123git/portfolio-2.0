const nodemailer = require('nodemailer');
const dns = require('dns').promises;

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const shouldForceIPv4 = () => {
  // Default to IPv4 in production because many cloud runtimes have incomplete IPv6 egress.
  if (typeof process.env.SMTP_FORCE_IPV4 === 'string') {
    return parseBoolean(process.env.SMTP_FORCE_IPV4);
  }

  return process.env.NODE_ENV === 'production';
};

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

const resolveSmtpIPv4Host = async (host) => {
  try {
    const addresses = await dns.resolve4(host);
    return addresses[0] || host;
  } catch {
    return host;
  }
};

const buildTransportConfig = async () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const smtpHost = process.env.SMTP_HOST || getProviderHost(emailService);
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? parseBoolean(process.env.SMTP_SECURE)
    : smtpPort === 465;
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000);
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 10000);
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 20000);

  const forceIPv4 = shouldForceIPv4();

  if (smtpHost) {
    let connectionHost = smtpHost;
    const tlsOptions = {};

    if (forceIPv4) {
      const ipv4Host = await resolveSmtpIPv4Host(smtpHost);
      if (ipv4Host !== smtpHost) {
        connectionHost = ipv4Host;
        // Preserve TLS cert validation for provider hostname when connecting by IP.
        tlsOptions.servername = smtpHost;
      }
    }

    return {
      host: connectionHost,
      port: smtpPort,
      secure,
      connectionTimeout,
      greetingTimeout,
      socketTimeout,
      ...(forceIPv4 ? { family: 4 } : {}),
      ...(Object.keys(tlsOptions).length > 0 ? { tls: tlsOptions } : {}),
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
    ...(forceIPv4 ? { family: 4 } : {}),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
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

  const transportConfig = await buildTransportConfig();
  const transporter = nodemailer.createTransport(transportConfig);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject,
    html: htmlContent,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    const currentTransportConfig = transporter?.options || {};
    console.error('Email send failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message,
      smtpHost: currentTransportConfig.host || currentTransportConfig.service || 'unknown',
      smtpPort: currentTransportConfig.port || 'unknown',
      secure: typeof currentTransportConfig.secure === 'boolean' ? currentTransportConfig.secure : 'unknown',
      family: currentTransportConfig.family || 'auto',
    });

    // Retry once with forced IPv4 for network-route issues.
    if ((error.code === 'ENETUNREACH' || error.code === 'ESOCKET') && currentTransportConfig.family !== 4) {
      try {
        const retryTransporter = nodemailer.createTransport({
          ...(await buildTransportConfig()),
          family: 4,
        });

        return await retryTransporter.sendMail(mailOptions);
      } catch (retryError) {
        console.error('Email retry with IPv4 failed:', {
          code: retryError.code,
          command: retryError.command,
          response: retryError.response,
          message: retryError.message,
        });
        throw retryError;
      }
    }

    throw error;
  }
};

module.exports = sendEmail;

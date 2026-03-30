const nodemailer = require('nodemailer');
const dns = require('dns').promises;

const RESEND_API_URL = 'https://api.resend.com/emails';
const PROVIDER_RESEND = 'resend';
const PROVIDER_SMTP = 'smtp';

const getEmailProvider = () => {
  const configured = String(process.env.EMAIL_PROVIDER || 'auto').trim().toLowerCase();

  if (configured === PROVIDER_RESEND || configured === PROVIDER_SMTP) {
    return configured;
  }

  return process.env.RESEND_API_KEY ? PROVIDER_RESEND : PROVIDER_SMTP;
};

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

const sendEmailWithResend = async ({ subject, htmlContent }) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Resend configuration missing: RESEND_API_KEY');
  }

  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const to = process.env.RESEND_TO || process.env.RECEIVER_EMAIL;

  if (!from || !to) {
    throw new Error('Resend configuration missing: RESEND_FROM or RECEIVER_EMAIL');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Resend API failed (${response.status}): ${responseText}`);
  }

  return response.json();
};

const sendEmail = async ({ subject, htmlContent }) => {
  const provider = getEmailProvider();

  if (provider === PROVIDER_RESEND) {
    try {
      return await sendEmailWithResend({ subject, htmlContent });
    } catch (error) {
      console.error('Resend email send failed:', {
        message: error.message,
      });
      throw error;
    }
  }

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

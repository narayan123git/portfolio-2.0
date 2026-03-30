const { sendMail } = require('./mailService');

const truncate = (value, maxLength = 240) => {
  const normalized = String(value || 'N/A');
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
};

const sendSecurityLogAlert = async (logDoc) => {
  const recipient = process.env.ALERT_EMAIL_TO;
  if (!recipient || !logDoc) {
    return false;
  }

  const occurredAt = new Date(logDoc.createdAt || Date.now()).toISOString();
  const eventType = logDoc.eventType || 'UNKNOWN_EVENT';
  const subject = `[Portfolio API][SECURITY] ${eventType} at ${occurredAt}`;

  const text = [
    'A new security event has been logged.',
    '',
    `Event: ${eventType}`,
    `Time: ${occurredAt}`,
    `IP: ${logDoc.ipAddress || 'Unknown'}`,
    `User-Agent: ${truncate(logDoc.userAgent || 'Unknown', 300)}`,
    `Details: ${truncate(logDoc.details || 'N/A', 1000)}`,
  ].join('\n');

  const html = `
    <h2>Portfolio API Security Alert</h2>
    <p>A new security event was recorded.</p>
    <ul>
      <li><strong>Event:</strong> ${eventType}</li>
      <li><strong>Time:</strong> ${occurredAt}</li>
      <li><strong>IP:</strong> ${logDoc.ipAddress || 'Unknown'}</li>
      <li><strong>User-Agent:</strong> ${truncate(logDoc.userAgent || 'Unknown', 300)}</li>
      <li><strong>Details:</strong> ${truncate(logDoc.details || 'N/A', 1000)}</li>
    </ul>
  `;

  try {
    return await sendMail({ to: recipient, subject, text, html });
  } catch (error) {
    console.error('Failed to send security log alert email:', error.message);
    return false;
  }
};

module.exports = {
  sendSecurityLogAlert,
};
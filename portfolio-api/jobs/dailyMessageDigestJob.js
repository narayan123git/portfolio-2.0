const cron = require('node-cron');
const Message = require('../models/Message');
const { sendMail } = require('../services/mailService');

let digestJob;

const formatDigestDate = (date, timezone) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const sendDailyMessageDigest = async () => {
  const recipient = process.env.ALERT_EMAIL_TO;
  if (!recipient) {
    return;
  }

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const messages = await Message.find({
    createdAt: {
      $gte: dayStart,
      $lte: now,
    },
  }).sort({ createdAt: 1 });

  if (messages.length === 0) {
    return;
  }

  const timezone = process.env.DAILY_MESSAGE_DIGEST_TIMEZONE || 'Asia/Kolkata';
  const dateLabel = formatDigestDate(now, timezone);
  const subject = `[Portfolio API] Daily message digest (${dateLabel}) - ${messages.length} new`;

  const text = [
    `You received ${messages.length} new message(s) today.`,
    '',
    ...messages.map((msg, index) => {
      const createdAt = new Date(msg.createdAt).toISOString();
      return [
        `${index + 1}. ${msg.name} <${msg.email}> at ${createdAt}`,
        `   ${String(msg.message || '').replace(/\s+/g, ' ').trim()}`,
      ].join('\n');
    }),
  ].join('\n\n');

  const rows = messages
    .map((msg) => {
      const createdAt = new Date(msg.createdAt).toISOString();
      const safeMessage = String(msg.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<tr><td>${createdAt}</td><td>${msg.name}</td><td>${msg.email}</td><td>${safeMessage}</td></tr>`;
    })
    .join('');

  const html = `
    <h2>Daily Message Digest</h2>
    <p>You received <strong>${messages.length}</strong> new message(s) today.</p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>Time (UTC)</th>
          <th>Name</th>
          <th>Email</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  try {
    await sendMail({ to: recipient, subject, text, html });
  } catch (error) {
    console.error('Failed to send daily message digest:', error.message);
  }
};

const startDailyMessageDigestJob = () => {
  if (digestJob) {
    return digestJob;
  }

  const cronExpression = process.env.DAILY_MESSAGE_DIGEST_CRON || '55 23 * * *';
  const timezone = process.env.DAILY_MESSAGE_DIGEST_TIMEZONE || 'Asia/Kolkata';

  if (!cron.validate(cronExpression)) {
    console.error(`Invalid DAILY_MESSAGE_DIGEST_CRON expression: ${cronExpression}`);
    return null;
  }

  digestJob = cron.schedule(
    cronExpression,
    async () => {
      await sendDailyMessageDigest();
    },
    { timezone }
  );

  console.log(
    `Daily message digest scheduler started (cron: ${cronExpression}, timezone: ${timezone})`
  );

  return digestJob;
};

module.exports = {
  startDailyMessageDigestJob,
  sendDailyMessageDigest,
};
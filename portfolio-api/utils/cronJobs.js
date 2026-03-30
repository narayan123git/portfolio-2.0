const cron = require('node-cron');
const Message = require('../models/Message');
const sendEmail = require('./sendEmail');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const startCronJobs = () => {
  cron.schedule('50 23 * * *', async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const messages = await Message.find({
        createdAt: { $gte: startOfToday },
      }).sort({ createdAt: 1 });

      if (messages.length === 0) {
        return;
      }

      const rows = messages
        .map(
          (msg) => `
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #334155; color: #e2e8f0;">${escapeHtml(msg.name)}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #334155; color: #bfdbfe;">${escapeHtml(msg.email)}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #334155; color: #fde68a;">${escapeHtml(msg.subject)}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #334155; color: #cbd5e1; white-space: pre-wrap;">${escapeHtml(msg.message)}</td>
            </tr>
          `
        )
        .join('');

      const htmlContent = `
        <div style="margin:0;padding:24px;background:linear-gradient(135deg,#0b1220,#172554 55%,#1f2937);font-family:Verdana,Segoe UI,Tahoma,sans-serif;line-height:1.55;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#020617;border:1px solid #334155;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#22c55e,#14b8a6);color:#052e16;">
                <p style="margin:0;font-size:12px;letter-spacing:1.2px;font-weight:700;text-transform:uppercase;">Portfolio Inbox Digest</p>
                <h2 style="margin:6px 0 0 0;font-size:24px;color:#022c22;">Daily Messages Snapshot</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 14px 0;color:#cbd5e1;">You received <strong style="color:#86efac;">${messages.length}</strong> message(s) today.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #334155;border-radius:10px;overflow:hidden;">
                  <thead>
                    <tr style="background:#111827;text-align:left;">
                      <th style="padding:10px 14px;border-bottom:1px solid #334155;color:#a7f3d0;">Name</th>
                      <th style="padding:10px 14px;border-bottom:1px solid #334155;color:#a7f3d0;">Email</th>
                      <th style="padding:10px 14px;border-bottom:1px solid #334155;color:#a7f3d0;">Subject</th>
                      <th style="padding:10px 14px;border-bottom:1px solid #334155;color:#a7f3d0;">Message</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
                <p style="margin:14px 0 0 0;font-size:12px;color:#94a3b8;">Automated summary generated at 11:50 PM server schedule.</p>
              </td>
            </tr>
          </table>
        </div>
      `;

      await sendEmail({
        subject: '📬 Daily Portfolio Messages Snapshot',
        htmlContent,
      });
    } catch (error) {
      console.error('Daily summary cron failed:', error.message);
    }
  });

  console.log('Cron jobs initialized (daily summary at 11:50 PM).');
};

module.exports = { startCronJobs };

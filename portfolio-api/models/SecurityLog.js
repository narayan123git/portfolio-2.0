const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const securityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'HONEYPOT_TRIGGER',
      'FAILED_LOGIN',
      'UNAUTHORIZED_ACCESS',
      'RATE_LIMIT_EXCEEDED',
      'CAPTCHA_FAILED',
    ],
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
  details: {
    type: String, // E.g., "Attempted to access /admin with invalid token"
  }
}, { timestamps: true });

// Automatically delete security logs after 5 days.
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5 * 24 * 60 * 60 });

securityLogSchema.post('save', async function notifySecurityEvent(logDoc) {
  try {
    if (logDoc.eventType === 'CAPTCHA_FAILED') {
      return;
    }

    const occurredAt = new Date(logDoc.createdAt || Date.now()).toISOString();
    const eventType = escapeHtml(logDoc.eventType || 'UNKNOWN');
    const severity = eventType.includes('FAILED') || eventType.includes('UNAUTHORIZED')
      ? 'High'
      : eventType.includes('CAPTCHA') || eventType.includes('HONEYPOT')
        ? 'Medium'
        : 'Info';

    await sendEmail({
      subject: `Security Alert: ${logDoc.eventType}`,
      htmlContent: `
        <div style="margin:0;padding:24px;background:linear-gradient(135deg,#0f172a 0%,#111827 45%,#1f2937 100%);font-family:Verdana,Segoe UI,Tahoma,sans-serif;color:#e5e7eb;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#0b1220;border:1px solid #334155;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#0ea5e9,#06b6d4);color:#042f2e;">
                <p style="margin:0;font-size:12px;letter-spacing:1.4px;font-weight:700;text-transform:uppercase;">Portfolio Shield Monitor</p>
                <h2 style="margin:6px 0 0 0;font-size:24px;line-height:1.2;color:#082f49;">Security Event Captured</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px;">
                <p style="margin:0 0 14px 0;color:#cbd5e1;">A new security activity was detected on your system.</p>
                <div style="display:inline-block;padding:6px 10px;background:#172554;border:1px solid #1d4ed8;border-radius:999px;font-size:12px;color:#bfdbfe;">
                  Severity: <strong>${escapeHtml(severity)}</strong>
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:collapse;border:1px solid #334155;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="width:38%;padding:10px 12px;background:#111827;border-bottom:1px solid #334155;color:#93c5fd;font-weight:600;">Event Type</td>
                    <td style="padding:10px 12px;background:#0f172a;border-bottom:1px solid #334155;color:#e2e8f0;">${eventType}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#111827;border-bottom:1px solid #334155;color:#93c5fd;font-weight:600;">IP Address</td>
                    <td style="padding:10px 12px;background:#0f172a;border-bottom:1px solid #334155;color:#e2e8f0;">${escapeHtml(logDoc.ipAddress || 'Unknown')}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#111827;border-bottom:1px solid #334155;color:#93c5fd;font-weight:600;">User Agent</td>
                    <td style="padding:10px 12px;background:#0f172a;border-bottom:1px solid #334155;color:#e2e8f0;word-break:break-word;">${escapeHtml(logDoc.userAgent || 'Unknown')}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#111827;border-bottom:1px solid #334155;color:#93c5fd;font-weight:600;">Details</td>
                    <td style="padding:10px 12px;background:#0f172a;border-bottom:1px solid #334155;color:#e2e8f0;word-break:break-word;">${escapeHtml(logDoc.details || 'N/A')}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#111827;color:#93c5fd;font-weight:600;">Time (UTC)</td>
                    <td style="padding:10px 12px;background:#0f172a;color:#e2e8f0;">${escapeHtml(occurredAt)}</td>
                  </tr>
                </table>
                <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;">This alert is auto-generated from your SecurityLog pipeline.</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
  } catch (error) {
    console.error('Security log email alert failed:', error.message);
  }
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);
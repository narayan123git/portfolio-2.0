const SecurityLog = require('../models/SecurityLog');

const honeypot = async (req, res, next) => {
  // Common URLs that malicious bots automatically scan for
  const forbiddenRoutes = ['/wp-admin', '/.env', '/admin.php', '/config.json', '/db-backup.zip'];

  if (forbiddenRoutes.includes(req.originalUrl)) {
    try {
      const payload = req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : 'No payload';
      const payloadPreview = payload.length > 500 ? `${payload.slice(0, 500)}...` : payload;

      // 1. Log the attacker's details to your database
      await SecurityLog.create({
        eventType: 'HONEYPOT_TRIGGER',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `Trap route hit: ${req.originalUrl}. Payload: ${payloadPreview}`,
      });

      console.log(`[SECURITY ALERT] Malicious bot trapped at ${req.originalUrl} from IP: ${req.ip}`);

      // 2. Drop the connection or send a fake response to waste the bot's time
      return res.status(403).json({ 
        error: 'Access Denied', 
        message: 'Your IP has been logged and flagged for malicious activity.' 
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // If it is a normal route, let them pass
  next();
};

module.exports = honeypot;
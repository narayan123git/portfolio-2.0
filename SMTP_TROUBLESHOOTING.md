# 📧 SMTP Troubleshooting Guide

Your mail service now has enhanced diagnostics to help identify connection issues. Here's how to debug and fix your setup.

## 🔍 Step 1: Check Environment Variables

Ensure your `.env` file has **ALL** these variables set correctly:

```bash
# Gmail SMTP Settings (Port 587 with STARTTLS)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false          # FALSE for port 587 (uses STARTTLS)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password    # NO SPACES
SMTP_FROM=your-email@gmail.com
ALERT_EMAIL_TO=recipient@example.com    # Where to send alerts

# SMTP Reliability Settings (Recommended for Gmail)
SMTP_FORCE_IPV4=true
SMTP_DNS_RESULT_ORDER=ipv4first
SMTP_CONNECTION_TIMEOUT_MS=20000        # 20 seconds
SMTP_GREETING_TIMEOUT_MS=15000          # 15 seconds
SMTP_SOCKET_TIMEOUT_MS=30000            # 30 seconds

# Daily Message Digest
DAILY_MESSAGE_DIGEST_CRON=55 23 * * *   # 11:55 PM daily
DAILY_MESSAGE_DIGEST_TIMEZONE=Asia/Kolkata

# Optional: Enable detailed SMTP debugging
SMTP_DEBUG=false          # Set to 'true' to see detailed SMTP logs
```

### ⚠️ Important for Gmail:
1. **Use an App Password, NOT your regular Gmail password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select Device: Windows/Mac/Linux
   - Select App: Mail
   - Generate 16-digit password (copy WITHOUT spaces)

2. **If you see "App Passwords" option missing:**
   - Enable 2-Step Verification first: https://myaccount.google.com/security
   - Then return to App Passwords

3. **Port 587 requires:**
   - `SMTP_SECURE=false` (uses STARTTLS upgrade)
   - NOT `SMTP_SECURE=true` (that's for port 465)

---

## 🛠️ Step 2: Test SMTP Connection

### Option A: Use the Diagnostic API Endpoint

After starting your server, make a POST request to test the connection:

```bash
# Login first to get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-admin-username","password":"your-password"}' \
  -c cookies.txt

# Test SMTP (admin-only endpoint)
curl -X POST http://localhost:5000/api/auth/test-mail \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"testEmail":"your-email@gmail.com"}'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox.",
  "testEmail": "your-email@gmail.com",
  "timestamp": "2026-03-30T10:15:30.000Z"
}
```

**Expected Response (Failure - with diagnostics):**
```json
{
  "success": false,
  "message": "SMTP test failed",
  "error": "Connection timeout",
  "code": "ETIMEDOUT",
  "details": {
    "host": "smtp.gmail.com",
    "port": "587",
    "secure": "false",
    "connectionTimeout": "20000",
    "ipv4Forced": "true"
  }
}
```

### Option B: Check Server Startup Logs

When you start the server, you should see:

✅ **Success:**
```
✅ SMTP configured and ready to send emails
```

❌ **Failure:**
```
⚠️ SMTP configuration error - emails may not work: Connection timeout
Please check your SMTP environment variables and try again.
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "Connection timeout"
**Causes:** Network blocked, wrong host, firewall, IPv6 routing issues

**Fixes:**
1. Verify credentials (email, app password, host) are correct
2. Try increasing timeout values:
   ```bash
   SMTP_CONNECTION_TIMEOUT_MS=30000     # Increase to 30 seconds
   SMTP_GREETING_TIMEOUT_MS=20000       # Increase to 20 seconds
   SMTP_SOCKET_TIMEOUT_MS=60000         # Increase to 60 seconds
   ```
3. Ensure `SMTP_FORCE_IPV4=true` is set
4. Check your network/firewall allows outbound on port 587
5. Try from a different network (e.g., phone hotspot) to test

### Issue 2: "Authentication failed" or "Invalid credentials"
**Causes:** Wrong app password, spaces in password, using regular Gmail password

**Fixes:**
1. Generate a NEW 16-digit app password (copy WITHOUT spaces)
2. Verify: `SMTP_USER=your-email@gmail.com` matches the account you generated the password for
3. If using different email providers (not Gmail):
   - Outlook: `SMTP_HOST=smtp-mail.outlook.com`, port 587
   - SendGrid: `SMTP_HOST=smtp.sendgrid.net`, port 587
   - Custom: Check your provider's SMTP settings

### Issue 3: "5xx SMTP server error"
**Causes:** Gmail rate limiting, account locked, suspicious activity

**Fixes:**
1. Check [Google Account Security](https://myaccount.google.com/security) for alerts
2. Unlock suspicious activity: https://accounts.google.com/signin/recovery
3. Wait 5-10 minutes before retrying
4. If rate limited, space out test emails or reduce digest frequency

### Issue 4: "Emails go to spam"
**Causes:** SPF/DKIM/DMARC records not configured, no FROM header

**Fixes:**
1. Always set `SMTP_FROM=your-email@gmail.com`
2. For production, configure SPF/DKIM records (outside scope of this config)

---

## 📊 How to Enable Debug Logging

Set this environment variable to see detailed SMTP communication:

```bash
SMTP_DEBUG=true
```

Then restart the server. You'll see verbose logs like:

```
[SMTP] Connecting to smtp.gmail.com:587 (IPv4)
[SMTP] Connected, waiting for greeting...
[SMTP] STARTTLS upgrade initiated...
[SMTP] Authenticating as user@gmail.com...
✓ Email sent successfully: { messageId: '<...' }
```

This helps identify exactly where the connection fails.

---

## 📋 Verification Checklist

Before assuming there's a code problem, verify:

- [ ] `.env` has all required SMTP variables
- [ ] Gmail app password is 16 digits with NO spaces
- [ ] `SMTP_SECURE=false` (for port 587) or `SMTP_SECURE=true` (for port 465)
- [ ] Server startup shows `✅ SMTP configured and ready to send emails`
- [ ] Test email endpoint returns success response
- [ ] Email appears in your inbox (check spam folder too!)
- [ ] Firewall allows outbound port 587 or 465

---

## 🚀 Once Verified Working

After confirming SMTP works:
1. **Daily digests** will automatically send at the configured time
2. **Security alerts** will trigger when:
   - Failed login attempts occur
   - CAPTCHA failures happen
   - Other security events are logged
3. **Check server logs** for `✓ Email sent successfully` messages

---

## 📞 Additional Resources

- [Nodemailer Gmail Config](https://nodemailer.com/smtp/gmail/)
- [Google App Passwords](https://myaccount.google.com/apppasswords)
- [Gmail Security Settings](https://myaccount.google.com/security)
- [SMTP Protocol Port Guide](https://nodemailer.com/smtp/)

---

Last updated: March 30, 2026

const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const USED_CAPTCHA_TOKENS = new Map();

const getSecretKey = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required for captcha security.');
  }

  return process.env.JWT_SECRET;
};

const cleanupUsedTokens = (now = Date.now()) => {
  for (const [token, expiresAt] of USED_CAPTCHA_TOKENS.entries()) {
    if (expiresAt <= now) {
      USED_CAPTCHA_TOKENS.delete(token);
    }
  }
};

exports.generateSecureCaptcha = () => {
  const secretKey = getSecretKey();

  const captcha = svgCaptcha.create({
    size: 5,
    noise: 4,
    color: true,
    ignoreChars: '0o1ilI',
    background: '#f8fafc'
  });

  const answer = captcha.text.toUpperCase();
  const token = crypto.randomBytes(16).toString('hex');

  const expires = Date.now() + CAPTCHA_TTL_MS;
  cleanupUsedTokens(expires);

  const payload = `${answer}:${expires}:${token}`;
  const hash = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

  return { svg: captcha.data, hash, expires, token };
};

exports.verifyCaptcha = (userInput, providedHash, providedExpires, providedToken) => {
  if (!userInput || !providedHash || !providedExpires || !providedToken) {
    return false;
  }

  const secretKey = getSecretKey();

  if (!/^[a-f0-9]{32}$/i.test(String(providedToken))) {
    return false;
  }

  cleanupUsedTokens();

  const normalizedToken = String(providedToken).toLowerCase();
  if (USED_CAPTCHA_TOKENS.has(normalizedToken)) {
    return false;
  }

  const expires = parseInt(providedExpires, 10);
  if (Number.isNaN(expires)) {
    return false;
  }

  if (Date.now() > expires) {
    return false;
  }

  const normalizedInput = String(userInput).trim().toUpperCase();
  if (!normalizedInput) {
    return false;
  }

  const payload = `${normalizedInput}:${expires}:${normalizedToken}`;
  const checkHash = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

  if (checkHash !== providedHash) {
    return false;
  }

  USED_CAPTCHA_TOKENS.set(normalizedToken, expires);
  return true;
};

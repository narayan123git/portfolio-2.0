const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_for_captcha';

exports.generateSecureCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 4,
    color: true,
    ignoreChars: '0o1ilI',
    background: '#f8fafc'
  });

  const answer = captcha.text.toUpperCase();

  const expires = Date.now() + (5 * 60 * 1000); 

  const payload = `${answer}:${expires}`;
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

  return { svg: captcha.data, hash, expires };
};

exports.verifyCaptcha = (userInput, providedHash, providedExpires) => {
  if (!userInput || !providedHash || !providedExpires) return false;

  const expires = parseInt(providedExpires, 10);
  if (Number.isNaN(expires)) return false;
  
  if (Date.now() > expires) return false;

  const normalizedInput = String(userInput).trim().toUpperCase();
  if (!normalizedInput) return false;

  const payload = `${normalizedInput}:${expires}`;
  const checkHash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  
  return checkHash === providedHash;
};

const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_for_captcha';

exports.generateSecureCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operator = Math.random() > 0.5 ? '+' : '*'; // Randomize operators!
  
  let answer;
  if (operator === '+') {
      answer = num1 + num2;
  } else {
      answer = num1 * num2;
  }

  // Create a secure expiration timestamp (e.g. valid for 5 minutes)
  const expires = Date.now() + (5 * 60 * 1000); 

  // Create a secure hash combining the answer and expiration time
  const payload = `${answer}:${expires}`;
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

  // We send the question, the hash, and the expiration to the client. We NEVER send 'answer'.
  return { num1, num2, operator, hash, expires };
};

exports.verifyCaptcha = (userAnswer, providedHash, providedExpires) => {
  if (!userAnswer || !providedHash || !providedExpires) return false;
  
  // Check if expired
  if (Date.now() > parseInt(providedExpires)) return false;

  // Re-hash the user's answer
  const payload = `${userAnswer}:${providedExpires}`;
  const checkHash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  
  return checkHash === providedHash; // It is secure only if hashes perfectly match
};

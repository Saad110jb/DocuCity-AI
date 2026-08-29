/**
 * Automated PII Redaction Middleware:
 * Scrubs citizen CNIC numbers, residential phone numbers, property owner records, IBANs, and private emails.
 */

function sanitizePiiString(text) {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;

  // 1. Pakistani IBAN & Bank Accounts: PKXXMEZN...
  sanitized = sanitized.replace(/\bPK\d{2}[A-Z]{4}\d{16}\b/gi, '[IBAN REDACTED]');

  // 2. Personal Emails
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b/g, '[EMAIL REDACTED]');

  // 3. Pakistani CNIC: 35202-XXXXXXX-X
  sanitized = sanitized.replace(/\b\d{5}-\d{7}-\d{1}\b/g, '[CNIC REDACTED]');

  // 4. Property Owner Records & Citizen Identity Patterns
  const propertyOwnerRegexes = [
    /\b(?:Property\s*Owner|Plot\s*Owner|Owner\s*Name|Applicant\s*Name|Citizen\s*Name|Owner\s*CNIC|Owner\s*Phone|Owner\s*Contact)\s*[:=-]\s*([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|\b(?:Plot|Sector|Phase|CNIC|Phone|Address|FAR|Height|Fee)\b|$)/gi,
    /\b(?:S\/O|D\/O|W\/O|s\/o|d\/o|w\/o)\s+([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|\b(?:CNIC|Phone|Plot|Address|Resident)\b|$)/gi,
    /\b(?:Ownership\s*Title\s*Registered\s*To|Transferred\s*To|Allotted\s*To)\s*[:=-]?\s*([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|$)/gi
  ];
  propertyOwnerRegexes.forEach(reg => {
    sanitized = sanitized.replace(reg, '[PROPERTY OWNER REDACTED]');
  });

  // 5. Pakistani Phone Numbers: +923..., 03..., 042-...
  sanitized = sanitized.replace(/\b(?:\+92|0092|0)(?:3\d{2}|42|51|21)[-\s]?\d{7,8}\b/g, '[PHONE REDACTED]');

  return sanitized;
}

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizePiiString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

function sanitizePiiMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
}

module.exports = sanitizePiiMiddleware;
module.exports.sanitizePiiString = sanitizePiiString;
module.exports.sanitizeObject = sanitizeObject;


/**
 * PII Redaction Middleware for CNIC numbers and phone numbers
 */
function sanitizePiiMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // CNIC pattern: XXXXX-XXXXXXX-X
      obj[key] = obj[key].replace(/\b\d{5}-\d{7}-\d{1}\b/g, '[CNIC REDACTED]');
      // Pakistani phone: 03XX-XXXXXXX
      obj[key] = obj[key].replace(/(\+92|0)?3\d{2}[-\s]?\d{7}\b/g, '[PHONE REDACTED]');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

module.exports = sanitizePiiMiddleware;

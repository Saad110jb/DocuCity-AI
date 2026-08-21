const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'docucity-lahore-super-secret-key-2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to public user if token not provided for public endpoints
    req.user = { id: 'public-guest', role: 'public', name: 'Lahore Citizen' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied. Role '${req.user ? req.user.role : 'guest'}' lacks permissions for this action.` 
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };

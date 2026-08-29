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

function requireRole(allowedRoles, actionDescription = "this action") {
  return (req, res, next) => {
    const currentRole = req.user ? req.user.role : 'public';
    if (!req.user || !allowedRoles.includes(currentRole)) {
      const isPublic = currentRole === 'public' || currentRole === 'guest' || currentRole === 'citizen';
      return res.status(403).json({ 
        error: isPublic
          ? `Access Denied: Public users have Read-Only permissions and cannot ${actionDescription}. Municipal Officer or Admin authorization is required.`
          : `Access Denied: Role '${currentRole}' lacks required permissions to ${actionDescription}.`,
        readOnlyEnforced: true,
        userRole: currentRole
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };

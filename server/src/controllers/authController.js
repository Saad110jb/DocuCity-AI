const jwt = require('jsonwebtoken');
const { findByEmail } = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'docucity-lahore-super-secret-key-2026';

async function login(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.userId || user.id, name: user.name, email: user.email, role: user.role, department: user.department },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.userId || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
}

function getMe(req, res) {
  return res.json({ user: req.user });
}

module.exports = { login, getMe };

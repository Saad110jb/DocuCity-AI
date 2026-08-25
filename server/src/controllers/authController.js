const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, findByEmail, MOCK_USERS } = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'docucity-lahore-super-secret-key-2026';

async function login(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Pre-configured root Super Admin login
  if (email.toLowerCase() === 'superadmin@docucity.lahore.gov.pk' && password === 'DocuCity@Lahore2026!') {
    const adminToken = jwt.sign(
      { id: 'usr-admin-001', name: 'Super Admin', email, role: 'admin', department: 'Global Platform Control' },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    return res.json({
      message: 'Super Admin login successful',
      token: adminToken,
      user: {
        id: 'usr-admin-001',
        name: 'Super Admin',
        email: email,
        role: 'admin',
        department: 'Global Platform Control'
      }
    });
  }

  const user = await findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let isValidPassword = false;
  try {
    if (user.password && user.password === password) {
      isValidPassword = true;
    } else if (user.passwordHash && user.passwordHash.startsWith('$2a$')) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } else if (user.passwordHash === password) {
      isValidPassword = true;
    }
  } catch (e) {
    isValidPassword = (user.password === password || user.passwordHash === password);
  }

  if (!isValidPassword) {
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

async function register(req, res) {
  try {
    const { fullName, email, password, phone, profession } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-cit-${Date.now()}`;

    const newUser = {
      userId,
      name: fullName,
      email: email.toLowerCase(),
      password: password, // Real readable password for Super Admin
      passwordHash: hashedPassword,
      role: 'public',
      department: profession ? `Citizen (${profession})` : 'Public Domain',
      status: 'Active',
      cnic: phone ? `03XX-${phone.slice(-7)}` : '35202-XXXXXXX-X'
    };

    if (mongoose.connection.readyState === 1) {
      const created = await User.create(newUser);
      console.log(`[MongoDB] Registered citizen with real password: ${created.email}`);
      return res.json({ message: 'User registered successfully in MongoDB', user: created });
    }

    MOCK_USERS.push(newUser);
    return res.json({ message: 'User registered in memory store', user: newUser });
  } catch (err) {
    console.error('[Register Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to register user.' });
  }
}

async function provisionOfficer(req, res) {
  try {
    const { name, email, department, role, tempPassword, scope } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Officer name and official email are required.' });
    }

    const passToSave = tempPassword || 'LDA-Lahore-2026!';
    const hashedPassword = await bcrypt.hash(passToSave, 10);
    const userId = `usr-off-${Date.now()}`;

    const newOfficer = {
      userId,
      name,
      email: email.toLowerCase(),
      password: passToSave, // Real readable password for Super Admin
      passwordHash: hashedPassword,
      role: role || 'officer',
      department: department || 'LDA',
      status: 'Active',
      cnic: `35202-${Math.floor(1000000 + Math.random() * 9000000)}-1`
    };

    if (mongoose.connection.readyState === 1) {
      const created = await User.create(newOfficer);
      console.log(`[MongoDB] Provisioned officer with real password: ${created.email}`);
      return res.json({ message: 'Officer provisioned in MongoDB', user: created });
    }

    MOCK_USERS.push(newOfficer);
    return res.json({ message: 'Officer provisioned in memory store', user: newOfficer });
  } catch (err) {
    console.error('[Provision Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to provision officer.' });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status, role, password } = req.body;

    let updatePayload = { ...(status && { status }), ...(role && { role }) };
    if (password) {
      updatePayload.password = password;
      updatePayload.passwordHash = await bcrypt.hash(password, 10);
    }

    if (mongoose.connection.readyState === 1) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ userId: userId }, { _id: userId }] },
        { $set: updatePayload },
        { new: true }
      );
      return res.json({ message: 'User updated in MongoDB', user: updated });
    }

    return res.json({ message: 'User updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function getMe(req, res) {
  return res.json({ user: req.user });
}

async function getAllUsers(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbUsers = await User.find();
      if (dbUsers && dbUsers.length > 0) {
        // Ensure every user object has a readable password field for Super Admin
        const formattedUsers = dbUsers.map(u => {
          const uObj = u.toObject();
          if (!uObj.password) {
            uObj.password = uObj.email.includes('officer') ? 'officer123' : uObj.email.includes('admin') ? 'admin123' : 'LDA-Lahore-2026!';
          }
          return uObj;
        });
        return res.json({ users: formattedUsers });
      }
    }
  } catch (err) {
    console.warn('[AuthController] Error fetching MongoDB users:', err.message);
  }

  return res.json({ users: MOCK_USERS });
}

module.exports = { login, register, provisionOfficer, updateUserStatus, getMe, getAllUsers };

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['public', 'officer', 'admin'], default: 'public' },
  department: { type: String, default: 'LDA Municipal Governance' },
  createdAt: { type: Date, default: Date.now }
});

let User;
try {
  User = mongoose.model('User', userSchema);
} catch (e) {
  User = mongoose.model('User');
}

// Pre-seeded fallback memory cache if MongoDB disconnected
const MOCK_USERS = [
  {
    id: "usr-001",
    userId: "usr-001",
    name: "Public Citizen",
    email: "citizen@lahore.gov.pk",
    passwordHash: "password123",
    role: "public",
    department: "Public Domain"
  },
  {
    id: "usr-002",
    userId: "usr-002",
    name: "Officer Tariq Mahmood",
    email: "officer@lda.gop.pk",
    passwordHash: "officer123",
    role: "officer",
    department: "LDA Commercial Verification Wing"
  },
  {
    id: "usr-003",
    userId: "usr-003",
    name: "System Admin",
    email: "admin@docucity.gov.pk",
    passwordHash: "admin123",
    role: "admin",
    department: "Punjab Urban Development Authority"
  }
];

async function findByEmail(email) {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) return user;
    } catch (e) {
      console.warn('[User Model] MongoDB query failed, falling back to seed dictionary:', e.message);
    }
  }
  return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function seedInitialUsers() {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await User.countDocuments();
      if (count === 0) {
        await User.insertMany(MOCK_USERS);
        console.log('[User Model] Seeded initial municipal users into MongoDB database.');
      }
    } catch (e) {
      console.warn('[User Model] Seed error:', e.message);
    }
  }
}

module.exports = { User, findByEmail, seedInitialUsers };

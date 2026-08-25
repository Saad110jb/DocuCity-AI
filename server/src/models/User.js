const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Real readable password for Super Admin inspection
  passwordHash: { type: String }, // Bcrypt hash
  role: { type: String, enum: ['public', 'officer', 'admin'], default: 'public' },
  department: { type: String, default: 'LDA Municipal Governance' },
  status: { type: String, enum: ['Active', 'Pending Verification', 'Suspended'], default: 'Active' },
  cnic: { type: String, default: '35202-XXXXXXX-X' },
  createdAt: { type: Date, default: Date.now }
});

let User;
try {
  User = mongoose.model('User', userSchema);
} catch (e) {
  User = mongoose.model('User');
}

// Pre-seeded fallback memory cache with real readable passwords
const MOCK_USERS = [
  {
    id: "usr-001",
    userId: "usr-001",
    name: "Public Citizen",
    email: "citizen@lahore.gov.pk",
    password: "password123",
    passwordHash: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
    role: "public",
    department: "Public Domain",
    status: "Active",
    cnic: "35202-4410294-2"
  },
  {
    id: "usr-002",
    userId: "usr-002",
    name: "Officer Tariq Mahmood",
    email: "officer@lda.gop.pk",
    password: "officer123",
    passwordHash: "$2a$10$w8.B7H.dJm1Q6g4O9Yk9I.tYmN6zS.Wn/Vj6x1q6q1q6q1q6q1q6q",
    role: "officer",
    department: "LDA Commercial Verification Wing",
    status: "Active",
    cnic: "35202-1294819-1"
  },
  {
    id: "usr-003",
    userId: "usr-003",
    name: "System Admin",
    email: "admin@docucity.gov.pk",
    password: "admin123",
    passwordHash: "$2a$10$x8.C7H.dJm1Q6g4O9Yk9I.tYmN6zS.Wn/Vj6x1q6q1q6q1q6q1q6q",
    role: "admin",
    department: "Punjab Urban Development Authority",
    status: "Active",
    cnic: "35202-0000000-0"
  }
];

async function findByEmail(email) {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) return user;
    } catch (e) {
      console.warn('[User Model] MongoDB query failed:', e.message);
    }
  }
  return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function seedInitialUsers() {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await User.countDocuments();
      if (count === 0) {
        const seeded = await Promise.all(MOCK_USERS.map(async (u) => {
          const plain = u.password || 'password123';
          const hashed = await bcrypt.hash(plain, 10);
          return { ...u, password: plain, passwordHash: hashed };
        }));
        await User.insertMany(seeded);
        console.log('[User Model] Seeded initial municipal users with readable passwords into MongoDB.');
      }
    } catch (e) {
      console.warn('[User Model] Seed error:', e.message);
    }
  }
}

module.exports = { User, findByEmail, seedInitialUsers, MOCK_USERS };

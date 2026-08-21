const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  auditId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  user: {
    id: String,
    name: String,
    role: String
  },
  action: { type: String, required: true },
  documentId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }
});

let DocumentAudit;
try {
  DocumentAudit = mongoose.model('DocumentAudit', auditSchema);
} catch (e) {
  DocumentAudit = mongoose.model('DocumentAudit');
}

const memoryLogs = [];

async function logActivity(user, action, documentId, details = {}) {
  const entry = {
    auditId: `audit-${Date.now()}`,
    timestamp: new Date(),
    user: {
      id: user ? user.id : 'anonymous',
      name: user ? user.name : 'Anonymous',
      role: user ? user.role : 'public'
    },
    action,
    documentId,
    details
  };

  memoryLogs.push(entry);

  if (mongoose.connection.readyState === 1) {
    try {
      await DocumentAudit.create(entry);
    } catch (e) {
      console.warn('[Audit Log] Failed to persist audit to MongoDB:', e.message);
    }
  }
  return entry;
}

async function getAuditLogs(limit = 50) {
  if (mongoose.connection.readyState === 1) {
    try {
      const logs = await DocumentAudit.find().sort({ timestamp: -1 }).limit(limit);
      if (logs && logs.length > 0) return logs;
    } catch (e) {
      console.warn('[Audit Log] MongoDB query error:', e.message);
    }
  }
  return memoryLogs.slice(-limit).reverse();
}

module.exports = { DocumentAudit, logActivity, getAuditLogs };

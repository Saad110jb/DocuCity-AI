const mongoose = require('mongoose');

const documentAuditSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  user: {
    userId: { type: String },
    name: { type: String, default: "Public Citizen" },
    role: { type: String, default: "public" }
  },
  action: { type: String, required: true }, // 'DOCUMENT_UPLOAD' | 'RAG_QUERY' | 'OFFICER_PROVISION' | 'SYSTEM_REINDEX'
  documentId: { type: String, default: "N/A" },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const pipelineErrorSchema = new mongoose.Schema({
  errorId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  stage: { type: String, required: true }, // 'OCR Extraction' | 'Geocoding Spatial Query' | 'Local Ollama Timeout'
  errorType: { type: String, required: true },
  message: { type: String, required: true },
  target: { type: String, default: "N/A" },
  resolved: { type: Boolean, default: false }
});

let DocumentAudit;
let PipelineError;
try {
  DocumentAudit = mongoose.model('DocumentAudit', documentAuditSchema);
  PipelineError = mongoose.model('PipelineError', pipelineErrorSchema);
} catch (e) {
  DocumentAudit = mongoose.model('DocumentAudit');
  PipelineError = mongoose.model('PipelineError');
}

async function recordAudit(auditData) {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await DocumentAudit.create({
        auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...auditData
      });
      return doc;
    } catch (e) {
      console.warn('[DocumentAudit] MongoDB record error:', e.message);
    }
  }
  return auditData;
}

async function getAuditLogs(limit = 50) {
  if (mongoose.connection.readyState === 1) {
    try {
      const logs = await DocumentAudit.find().sort({ timestamp: -1 }).limit(limit);
      if (logs && logs.length > 0) return logs;
    } catch (e) {
      console.warn('[DocumentAudit] MongoDB fetch error:', e.message);
    }
  }
  return [];
}

async function getPipelineErrors() {
  if (mongoose.connection.readyState === 1) {
    try {
      const errs = await PipelineError.find().sort({ timestamp: -1 });
      if (errs && errs.length > 0) return errs;
    } catch (e) {
      console.warn('[PipelineError] MongoDB fetch error:', e.message);
    }
  }
  return [];
}

async function resolvePipelineError(id) {
  if (mongoose.connection.readyState === 1) {
    try {
      return await PipelineError.findOneAndUpdate(
        { $or: [{ errorId: id }, { _id: id }] },
        { $set: { resolved: true } },
        { new: true }
      );
    } catch (e) {
      console.warn('[PipelineError] MongoDB resolve error:', e.message);
    }
  }
  return null;
}

async function seedInitialAuditAndErrors() {
  if (mongoose.connection.readyState === 1) {
    try {
      const auditCount = await DocumentAudit.countDocuments();
      if (auditCount === 0) {
        await DocumentAudit.insertMany([
          {
            auditId: "audit-001",
            timestamp: new Date(),
            user: { name: "Officer Tariq Mahmood", role: "officer" },
            action: "DOCUMENT_UPLOAD",
            documentId: "doc-89a1f2c",
            details: { filename: "LDA_Gulberg_Commercial_Notification_2024.pdf" }
          },
          {
            auditId: "audit-002",
            timestamp: new Date(),
            user: { name: "Public Citizen", role: "public" },
            action: "RAG_QUERY",
            documentId: "N/A",
            details: { query: "What is the allowed FAR in Johar Town Phase 2?" }
          }
        ]);
      }

      const errCount = await PipelineError.countDocuments();
      if (errCount === 0) {
        await PipelineError.insertMany([
          {
            errorId: "err-101",
            timestamp: new Date(),
            stage: "OCR Extraction",
            errorType: "PyPDF2 Empty Text Exception",
            message: "PDF page 4 contains unreadable scanned bitmap image. Fallback OCR engaged.",
            target: "LDA_Zone1_Gazette_2024.pdf",
            resolved: false
          },
          {
            errorId: "err-102",
            timestamp: new Date(),
            stage: "Geocoding Spatial Query",
            errorType: "Shapely Point Out of Polygon Bounds",
            message: "Point [74.4501, 31.3901] fell outside registered LDA zoning polygon bounds. Defaulted to nearest district.",
            target: "Point Query (31.3901 N, 74.4501 E)",
            resolved: true
          }
        ]);
      }
    } catch (e) {
      console.warn('[DocumentAudit] MongoDB seed error:', e.message);
    }
  }
}

module.exports = {
  DocumentAudit,
  PipelineError,
  recordAudit,
  getAuditLogs,
  getPipelineErrors,
  resolvePipelineError,
  seedInitialAuditAndErrors
};

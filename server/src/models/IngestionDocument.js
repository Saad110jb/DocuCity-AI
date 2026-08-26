const mongoose = require('mongoose');

const ingestionDocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  filename: { type: String, required: true },
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '2.4 MB' },
  uploadTimestamp: { type: Date, default: Date.now },
  uploader: {
    userId: { type: String },
    name: { type: String, default: "Municipal Officer Tariq" },
    department: { type: String, default: "LDA Commercial Verification Wing" }
  },
  aiMetadata: {
    issuingAuthority: { type: String, enum: ['LDA', 'WASA', 'MCL', 'Urban Unit', 'DHA Lahore', 'Walled City Authority'], default: 'LDA' },
    jurisdiction: { type: String, default: 'All Lahore Metropolitan District' },
    sector: { type: String, default: 'Zone 1' },
    publicationDate: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['Zoning Bylaws', 'Commercialization Rules', 'Water Tariffs', 'Building Codes', 'Encroachment Notices', 'Master Plan 2050', 'Heritage Conservation'],
      default: 'Zoning Bylaws'
    },
    confidenceScore: { type: Number, default: 0.94 }
  },
  stagingStatus: {
    type: String,
    enum: ['Internal Draft (Staged)', 'Formal Gazette Enacted (Published)'],
    default: 'Internal Draft (Staged)'
  },
  targetCollection: { type: String, default: 'docucity_internal_officer_gazette' },
  conflictDetection: {
    hasConflict: { type: Boolean, default: false },
    conflictingDocumentId: { type: String },
    conflictingClause: { type: String },
    conflictSummary: { type: String },
    policyResolution: {
      type: String,
      enum: ['Active', 'Superseded', 'Partially Amended', 'Pending Review'],
      default: 'Pending Review'
    }
  },
  queueProgress: {
    status: { type: String, enum: ['Queued', 'OCR Scanning', 'PII Sanitization', 'Vectorizing', 'Completed', 'Failed'], default: 'Completed' },
    percentage: { type: Number, default: 100 },
    currentStage: { type: String, default: 'Ready for Staging QA' }
  }
});

let IngestionDocument;
try {
  IngestionDocument = mongoose.model('IngestionDocument', ingestionDocumentSchema);
} catch (e) {
  IngestionDocument = mongoose.model('IngestionDocument');
}

const initialIngestionDocs = [
  {
    documentId: "doc-ingest-001",
    title: "LDA High-Density Commercialization Bylaws 2026 Amendment",
    filename: "LDA_Commercial_Bylaws_2026_Draft.pdf",
    fileType: "PDF",
    fileSize: "4.2 MB",
    uploadTimestamp: new Date("2026-08-25T10:15:00Z"),
    uploader: { name: "Officer Tariq Mahmood", department: "LDA Commercial Verification Wing" },
    aiMetadata: {
      issuingAuthority: "LDA",
      jurisdiction: "Gulberg Commercial Zone (Main Blvd & M.M. Alam)",
      sector: "Zone 1",
      publicationDate: new Date("2026-08-25"),
      category: "Commercialization Rules",
      confidenceScore: 0.96
    },
    stagingStatus: "Internal Draft (Staged)",
    targetCollection: "docucity_internal_officer_gazette",
    conflictDetection: {
      hasConflict: true,
      conflictingDocumentId: "doc-legacy-1998",
      conflictingClause: "Clause 4.2 - High Density FAR (1998 Gazette)",
      conflictSummary: "Increases allowed FAR from 1:4 to 1:8 on Main Boulevard plots.",
      policyResolution: "Partially Amended"
    },
    queueProgress: { status: "Completed", percentage: 100, currentStage: "Indexed in MongoDB Vector Search" }
  },
  {
    documentId: "doc-ingest-002",
    title: "WASA Johar Town Drainage Tariffs & Sewerage Circular",
    filename: "WASA_Tariff_Circular_2026.pdf",
    fileType: "PDF",
    fileSize: "1.8 MB",
    uploadTimestamp: new Date("2026-08-24T14:20:00Z"),
    uploader: { name: "Officer Tariq Mahmood", department: "WASA Infrastructure" },
    aiMetadata: {
      issuingAuthority: "WASA",
      jurisdiction: "Johar Town (Phase 1 & 2, Blocks A-R)",
      sector: "Ravi & Johar Drainage Sector",
      publicationDate: new Date("2026-08-24"),
      category: "Water Tariffs",
      confidenceScore: 0.92
    },
    stagingStatus: "Formal Gazette Enacted (Published)",
    targetCollection: "docucity_public_bylaws",
    conflictDetection: {
      hasConflict: false,
      conflictSummary: "No policy overlap detected with historical gazette notifications.",
      policyResolution: "Active"
    },
    queueProgress: { status: "Completed", percentage: 100, currentStage: "Public Vector Collection Active" }
  },
  {
    documentId: "doc-ingest-003",
    title: "All Lahore Master Plan 2050 Zoning Gazette Notification",
    filename: "Lahore_Master_Plan_2050_Gazette.pdf",
    fileType: "PDF",
    fileSize: "12.5 MB",
    uploadTimestamp: new Date("2026-08-20T09:00:00Z"),
    uploader: { name: "Super Admin", department: "Punjab Urban Development Authority" },
    aiMetadata: {
      issuingAuthority: "LDA",
      jurisdiction: "All Lahore Metropolitan District (City-Wide)",
      sector: "All Municipal Zones",
      publicationDate: new Date("2026-08-20"),
      category: "Master Plan 2050",
      confidenceScore: 0.98
    },
    stagingStatus: "Formal Gazette Enacted (Published)",
    targetCollection: "docucity_public_bylaws",
    conflictDetection: {
      hasConflict: false,
      conflictSummary: "City-wide master plan Gazette notification.",
      policyResolution: "Active"
    },
    queueProgress: { status: "Completed", percentage: 100, currentStage: "Public Vector Collection Active" }
  }
];

async function seedInitialIngestionDocuments() {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await IngestionDocument.countDocuments();
      if (count === 0) {
        await IngestionDocument.insertMany(initialIngestionDocs);
        console.log('[IngestionDocument] Seeded initial municipal officer staging documents into MongoDB ingestiondocuments collection.');
      }
    } catch (e) {
      console.warn('[IngestionDocument] Seed warning:', e.message);
    }
  }
}

module.exports = { IngestionDocument, seedInitialIngestionDocuments, initialIngestionDocs };

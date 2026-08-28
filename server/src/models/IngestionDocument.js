const mongoose = require('mongoose');

const ingestionDocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  filename: { type: String, required: true },
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '2.4 MB' },
  fileUrl: { type: String },
  totalPages: { type: Number, default: 2 },
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
    documentId: "doc-ingest-1787770663300",
    title: "2.LDA Landuse Rules 2020",
    filename: "2.LDA Landuse Rules_2020.pdf",
    fileType: "PDF",
    fileSize: "30.9 MB",
    totalPages: 206,
    uploadTimestamp: new Date("2026-08-26T18:57:43.300Z"),
    uploader: { name: "Municipal Officer", department: "LDA" },
    aiMetadata: {
      issuingAuthority: "LDA",
      jurisdiction: "All Lahore Metropolitan District (City-Wide)",
      sector: "Lahore Zone",
      publicationDate: new Date("2026-08-26"),
      category: "Zoning Bylaws",
      confidenceScore: 0.96
    },
    stagingStatus: "Formal Gazette Enacted (Published)",
    targetCollection: "docucity_public_bylaws",
    conflictDetection: {
      hasConflict: false,
      conflictSummary: "No overlapping legacy bylaws found in MongoDB index.",
      policyResolution: "Active"
    },
    queueProgress: { status: "Completed", percentage: 100, currentStage: "Parsed 206 pages & isolated to LDA Scope" }
  },
  {
    documentId: "doc-ingest-001",
    title: "1.Amendments in LDA Building & Zoning Regulations-2019",
    filename: "1.Amendments in LDA Building & Zoning Regulations-2019.pdf",
    fileType: "PDF",
    fileSize: "0.8 MB",
    totalPages: 2,
    uploadTimestamp: new Date("2026-08-25T10:15:00Z"),
    uploader: { name: "Municipal Officer", department: "LDA" },
    aiMetadata: {
      issuingAuthority: "LDA",
      jurisdiction: "All Lahore Metropolitan District (City-Wide)",
      sector: "Zone 1",
      publicationDate: new Date("2026-08-25"),
      category: "Zoning Bylaws",
      confidenceScore: 0.99
    },
    stagingStatus: "Internal Draft (Staged)",
    targetCollection: "docucity_internal_officer_gazette",
    conflictDetection: {
      hasConflict: false,
      conflictSummary: "Office Order No. LDA/DC&I/725 Dated 28.10.2022.",
      policyResolution: "Active"
    },
    queueProgress: { status: "Completed", percentage: 100, currentStage: "Parsed 2 pages & isolated to LDA Scope" }
  },
  {
    documentId: "doc-ingest-113",
    title: "09-02-2026-amended-building-regulations-2019-with-amendment",
    filename: "09-02-2026-amended-building-regulations-2019-with-amendment.pdf",
    fileType: "PDF",
    fileSize: "2.0 MB",
    totalPages: 113,
    uploadTimestamp: new Date("2026-08-26T12:00:00Z"),
    uploader: { name: "Municipal Officer", department: "LDA" },
    aiMetadata: {
      issuingAuthority: "LDA",
      jurisdiction: "All Lahore Metropolitan District (City-Wide)",
      sector: "Zone 1",
      publicationDate: new Date("2026-08-26"),
      category: "Zoning Bylaws",
      confidenceScore: 0.98
    },
    stagingStatus: "Internal Draft (Staged)",
    targetCollection: "docucity_internal_officer_gazette",
    conflictDetection: {
      hasConflict: false,
      conflictSummary: "Full 113-page master building regulations.",
      policyResolution: "Active"
    },
    queueProgress: { status: "Completed", percentage: 100, currentStage: "Parsed 113 pages & isolated to LDA Scope" }
  }
];

async function seedInitialIngestionDocuments() {
  if (mongoose.connection.readyState === 1) {
    try {
      // Sync or insert initial documents with exact totalPages
      for (const doc of initialIngestionDocs) {
        await IngestionDocument.findOneAndUpdate(
          { documentId: doc.documentId },
          { $set: doc },
          { upsert: true }
        );
      }
      console.log('[IngestionDocument] Synced initial municipal officer documents into MongoDB with exact totalPages!');
    } catch (e) {
      console.warn('[IngestionDocument] Seed warning:', e.message);
    }
  }
}

module.exports = { IngestionDocument, seedInitialIngestionDocuments, initialIngestionDocs };

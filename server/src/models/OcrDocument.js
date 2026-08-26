const mongoose = require('mongoose');

const ocrDocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  totalPages: { type: Number, default: 4 },
  currentPage: { type: Number, default: 1 },
  scannedImagePreviewUrl: { type: String, default: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop" },
  textChunks: [
    {
      id: String,
      bbox: Object,
      englishText: String,
      urduText: String,
      confidence: Number
    }
  ],
  tabularBylaws: [
    {
      id: String,
      zone: String,
      minPlotSize: String,
      maxFAR: String,
      maxHeight: String,
      frontSetback: String,
      sideSetback: String,
      commercialFeeTier: String
    }
  ],
  namedEntities: [
    {
      id: String,
      label: String,
      text: String,
      confidence: Number
    }
  ],
  redactedPii: [
    {
      id: String,
      piiCategory: String,
      original: String,
      redacted: String,
      verified: Boolean
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

let OcrDocument;
try {
  OcrDocument = mongoose.model('OcrDocument', ocrDocumentSchema);
} catch (e) {
  OcrDocument = mongoose.model('OcrDocument');
}

const defaultOcrData = {
  documentId: "doc-ingest-001",
  filename: "LDA_Commercial_Bylaws_2026_Draft.pdf",
  totalPages: 4,
  currentPage: 1,
  scannedImagePreviewUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop",
  textChunks: [
    {
      id: "chk-1",
      bbox: { x: 10, y: 15, width: 80, height: 12 },
      englishText: "Clause 4.2 - High Density Commercial Floor Area Ratio (FAR) Regulations 2026",
      urduText: "شق 4.2 - اعلی کثافت والی تجارتی فلور ایریا ریشو (FAR) ضوابط 2026",
      confidence: 0.96
    },
    {
      id: "chk-2",
      bbox: { x: 10, y: 32, width: 85, height: 18 },
      englishText: "Commercial plots situated on Main Boulevard Gulberg shall be permitted a maximum height of 120ft and FAR of 1:8 with 20ft front setback.",
      urduText: "مین بلیوارڈ گلبرگ پر واقع تجارتی پلاٹوں کو 120 فٹ کی زیادہ سے زیادہ اونچائی اور 20 فٹ فرنٹ سیٹ بیک کے ساتھ 1:8 کا FAR اجازت ہوگی۔",
      confidence: 0.94
    }
  ],
  tabularBylaws: [
    { id: "tbl-1", zone: "Gulberg Main Blvd", minPlotSize: "1 Kanal", maxFAR: "1:8", maxHeight: "120 ft", frontSetback: "20 ft", sideSetback: "10 ft", commercialFeeTier: "Tier 1 (Premium)" },
    { id: "tbl-2", zone: "Johar Town Phase 2", minPlotSize: "10 Marla", maxFAR: "1:4", maxHeight: "45 ft", frontSetback: "10 ft", sideSetback: "5 ft", commercialFeeTier: "Tier 2 (Standard)" },
    { id: "tbl-3", zone: "Model Town Heritage", minPlotSize: "2 Kanal", maxFAR: "1:2", maxHeight: "30 ft", frontSetback: "30 ft", sideSetback: "15 ft", commercialFeeTier: "Tier 1 (Special Heritage)" }
  ],
  namedEntities: [
    { id: "ent-1", label: "GAZETTE_NUM", text: "LDA/2026/G-88", confidence: 0.98 },
    { id: "ent-2", label: "FAR_LIMIT", text: "1:8", confidence: 0.97 },
    { id: "ent-3", label: "HEIGHT_ALLOWANCE", text: "120 ft", confidence: 0.95 },
    { id: "ent-4", label: "LOCATION", text: "Gulberg Commercial Zone", confidence: 0.99 },
    { id: "ent-5", label: "NOTIFICATION_DATE", text: "2026-08-25", confidence: 0.99 }
  ],
  redactedPii: [
    { id: "pii-1", piiCategory: "CNIC", original: "35202-7386736-1", redacted: "[CNIC REDACTED]", verified: true },
    { id: "pii-2", piiCategory: "PHONE", original: "0300-1234567", redacted: "[PHONE REDACTED]", verified: true }
  ]
};

async function seedInitialOcrDocuments() {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await OcrDocument.countDocuments();
      if (count === 0) {
        await OcrDocument.create(defaultOcrData);
        console.log('[OcrDocument] Seeded initial OCR document details into MongoDB ocrdocuments collection.');
      }
    } catch (e) {
      console.warn('[OcrDocument] Seed warning:', e.message);
    }
  }
}

module.exports = { OcrDocument, seedInitialOcrDocuments, defaultOcrData };

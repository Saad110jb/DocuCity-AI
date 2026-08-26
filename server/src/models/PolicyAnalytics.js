const mongoose = require('mongoose');

const queryHeatmapSchema = new mongoose.Schema({
  queryId: { type: String, required: true, unique: true },
  queryText: { type: String, required: true },
  location: { type: String, default: "Gulberg Commercial Zone" },
  category: { type: String, default: "Commercialization Rules" },
  frequencyCount: { type: Number, default: 1 },
  avgConfidenceScore: { type: Number, default: 0.92 },
  lastQueriedAt: { type: Date, default: Date.now }
});

const searchGapSchema = new mongoose.Schema({
  gapId: { type: String, required: true, unique: true },
  queryText: { type: String, required: true },
  location: { type: String, default: "Johar Town Phase 2" },
  vectorSimilarityScore: { type: Number, default: 0.48 }, // Low similarity < 0.65
  missingRegulationSubject: { type: String, default: "High-Rise Roof Garden Water Tariff Bylaws 2026" },
  suggestedAction: { type: String, default: "Upload missing WASA circular or index 2026 amendment." },
  status: { type: String, enum: ['Open Gap', 'Under Officer Review', 'Resolved & Indexed'], default: 'Open Gap' },
  detectedAt: { type: Date, default: Date.now }
});

const citationDisputeSchema = new mongoose.Schema({
  disputeId: { type: String, required: true, unique: true },
  submittedBy: {
    name: { type: String, default: "Architect Haroon Rasheed" },
    role: { type: String, default: "Registered PCATP Architect" },
    email: { type: String, default: "haroon@architects.pk" }
  },
  disputedDocumentTitle: { type: String, default: "LDA Commercial Bylaws 1998 Clause 4.2" },
  disputedClause: { type: String, default: "FAR 1:4 Commercial Limit" },
  feedbackMessage: { type: String, default: "The 1998 clause is cited, but LDA 2026 Gazette Amendment increased allowed FAR to 1:8 on Main Boulevard plots." },
  resolutionStatus: { type: String, enum: ['Pending Officer Review', 'Clause Updated', 'Dispute Rejected', 'Escalated to Legal Wing'], default: 'Pending Officer Review' },
  submittedAt: { type: Date, default: Date.now }
});

let QueryHeatmap, SearchGap, CitationDispute;
try {
  QueryHeatmap = mongoose.model('QueryHeatmap', queryHeatmapSchema);
  SearchGap = mongoose.model('SearchGap', searchGapSchema);
  CitationDispute = mongoose.model('CitationDispute', citationDisputeSchema);
} catch (e) {
  QueryHeatmap = mongoose.model('QueryHeatmap');
  SearchGap = mongoose.model('SearchGap');
  CitationDispute = mongoose.model('CitationDispute');
}

const initialHeatmapQueries = [
  { queryId: "q-001", queryText: "Height limit in Gulberg Commercial Main Boulevard", location: "Gulberg Commercial Zone", category: "Building Codes", frequencyCount: 142, avgConfidenceScore: 0.96 },
  { queryId: "q-002", queryText: "Johar Town commercial conversion fee per kanal", location: "Johar Town Phase 2", category: "Commercialization Rules", frequencyCount: 118, avgConfidenceScore: 0.94 },
  { queryId: "q-003", queryText: "WASA Johar Town water tariff 2026", location: "Johar Town Phase 2", category: "Water Tariffs", frequencyCount: 95, avgConfidenceScore: 0.91 },
  { queryId: "q-004", queryText: "Model Town residential front setback requirements", location: "Model Town", category: "Zoning Bylaws", frequencyCount: 84, avgConfidenceScore: 0.95 },
  { queryId: "q-005", queryText: "DHA Phase 6 commercial FAR regulations", location: "DHA Lahore", category: "Commercialization Rules", frequencyCount: 76, avgConfidenceScore: 0.89 }
];

const initialSearchGaps = [
  { gapId: "gap-001", queryText: "Solar rooftop installation subsidy regulations 2026", location: "All Lahore", vectorSimilarityScore: 0.42, missingRegulationSubject: "Punjab Green Energy Rooftop Solar Gazette 2026", suggestedAction: "Upload missing Punjab Energy Department circular into MongoDB Vector Search.", status: "Open Gap" },
  { gapId: "gap-002", queryText: "Ravi Riverfront Special Development Zone building height caps", location: "Shahdara Town & Ravi Zone", vectorSimilarityScore: 0.51, missingRegulationSubject: "RUDA Master Plan Environmental Impact Gazette", suggestedAction: "Index RUDA Environmental Impact Notification.", status: "Under Officer Review" }
];

const initialDisputes = [
  {
    disputeId: "disp-001",
    submittedBy: { name: "Architect Haroon Rasheed", role: "Registered PCATP Architect", email: "haroon@architects.pk" },
    disputedDocumentTitle: "LDA Commercial Bylaws 1998 Clause 4.2",
    disputedClause: "FAR 1:4 Commercial Limit",
    feedbackMessage: "The 1998 clause is cited in public chat, but LDA 2026 Gazette Amendment increased allowed FAR to 1:8 on Main Boulevard plots.",
    resolutionStatus: "Pending Officer Review",
    submittedAt: new Date("2026-08-25T14:30:00Z")
  },
  {
    disputeId: "disp-002",
    submittedBy: { name: "Engineer Usman Malik", role: "Structural Consultant", email: "usman@civilengineers.org" },
    disputedDocumentTitle: "WASA Sewerage Clearance Certificate Guidelines",
    disputedClause: "Clause 12 - High Rise Connection Fees",
    feedbackMessage: "Citation links to 2020 fee structure instead of updated 2026 WASA Tariff Circular.",
    resolutionStatus: "Pending Officer Review",
    submittedAt: new Date("2026-08-24T09:15:00Z")
  }
];

async function seedInitialAnalyticsData() {
  if (mongoose.connection.readyState === 1) {
    try {
      if (await QueryHeatmap.countDocuments() === 0) await QueryHeatmap.insertMany(initialHeatmapQueries);
      if (await SearchGap.countDocuments() === 0) await SearchGap.insertMany(initialSearchGaps);
      if (await CitationDispute.countDocuments() === 0) await CitationDispute.insertMany(initialDisputes);
      console.log('[PolicyAnalytics] Seeded initial heatmap queries, search gaps, and citation disputes in MongoDB.');
    } catch (e) {
      console.warn('[PolicyAnalytics] Seed warning:', e.message);
    }
  }
}

module.exports = {
  QueryHeatmap,
  SearchGap,
  CitationDispute,
  seedInitialAnalyticsData,
  initialHeatmapQueries,
  initialSearchGaps,
  initialDisputes
};

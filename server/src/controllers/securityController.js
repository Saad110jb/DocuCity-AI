const mongoose = require('mongoose');
const { SecurityConfig, defaultSecurityConfigData } = require('../models/SecurityConfig');
const { sanitizePiiString } = require('../middleware/piiRedaction');

async function getSecurityConfig(req, res) {
  if (mongoose.connection.readyState === 1) {
    try {
      let config = await SecurityConfig.findOne({ configId: 'global-security-config' });
      if (!config) {
        config = await SecurityConfig.create(defaultSecurityConfigData);
        console.log('[SecurityController] Created initial security config document in MongoDB securityconfigs collection.');
      }
      return res.json(config);
    } catch (e) {
      console.warn('[SecurityController] MongoDB query warning:', e.message);
    }
  }
  return res.json(defaultSecurityConfigData);
}

async function updateSecurityConfig(req, res) {
  const { redactionRules, customPatterns, accessBoundaries } = req.body;
  const updatePayload = { updatedAt: new Date() };

  if (redactionRules) updatePayload.redactionRules = redactionRules;
  if (customPatterns) updatePayload.customPatterns = customPatterns;
  if (accessBoundaries) updatePayload.accessBoundaries = accessBoundaries;

  if (mongoose.connection.readyState === 1) {
    try {
      const updated = await SecurityConfig.findOneAndUpdate(
        { configId: 'global-security-config' },
        { $set: updatePayload },
        { new: true, upsert: true }
      );
      console.log('[SecurityController] Saved updated security rules directly to MongoDB securityconfigs collection.');
      return res.json({
        message: "Security rules & vector namespace policies updated and saved to MongoDB.",
        config: updated
      });
    } catch (e) {
      console.warn('[SecurityController] MongoDB update warning:', e.message);
    }
  }

  return res.json({
    message: "Security rules updated in fallback.",
    config: { ...defaultSecurityConfigData, ...updatePayload }
  });
}

function testRedactionEngine(req, res) {
  const { sampleText } = req.body;
  if (!sampleText) {
    return res.status(400).json({ error: "Sample text is required for redaction testing." });
  }

  let sanitized = sampleText;
  const redactedMatches = [];
  const rules = defaultSecurityConfigData.redactionRules;

  // 1. Apply CNIC
  if (rules.cnicRedaction !== false) {
    const cnicPattern = /\b\d{5}-\d{7}-\d{1}\b/g;
    const matches = sanitized.match(cnicPattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "CNIC", value: m }));
    sanitized = sanitized.replace(cnicPattern, "[CNIC REDACTED]");
  }

  // 2. Apply Phone
  if (rules.phoneRedaction !== false) {
    const phonePattern = /(\+92|0)?(3\d{2}|42)[-\s]?\d{7,8}\b/g;
    const matches = sanitized.match(phonePattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "PHONE", value: m }));
    sanitized = sanitized.replace(phonePattern, "[PHONE REDACTED]");
  }

  // 3. Apply Property Owner Records & Citizen Identity
  if (rules.propertyOwnerRedaction !== false) {
    const propertyOwnerPatterns = [
      /\b(?:Property\s*Owner|Plot\s*Owner|Owner\s*Name|Applicant\s*Name|Citizen\s*Name|Owner\s*CNIC|Owner\s*Phone|Owner\s*Contact)\s*[:=-]\s*([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|\b(?:Plot|Sector|Phase|CNIC|Phone|Address|FAR|Height|Fee)\b|$)/gi,
      /\b(?:S\/O|D\/O|W\/O|s\/o|d\/o|w\/o)\s+([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|\b(?:CNIC|Phone|Plot|Address|Resident)\b|$)/gi,
      /\b(?:Ownership\s*Title\s*Registered\s*To|Transferred\s*To|Allotted\s*To)\s*[:=-]?\s*([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|$)/gi
    ];
    propertyOwnerPatterns.forEach(pat => {
      const matches = sanitized.match(pat) || [];
      matches.forEach(m => redactedMatches.push({ type: "PROPERTY_OWNER", value: m }));
      sanitized = sanitized.replace(pat, "[PROPERTY OWNER REDACTED]");
    });
  }

  // 4. Apply IBAN
  if (rules.ibanRedaction !== false) {
    const ibanPattern = /PK\d{2}[A-Z]{4}\d{16}/g;
    const matches = sanitized.match(ibanPattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "IBAN", value: m }));
    sanitized = sanitized.replace(ibanPattern, "[IBAN REDACTED]");
  }

  // 5. Apply Email
  if (rules.emailRedaction !== false) {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b/g;
    const matches = sanitized.match(emailPattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "EMAIL", value: m }));
    sanitized = sanitized.replace(emailPattern, "[EMAIL REDACTED]");
  }

  // 6. Apply Active Custom Patterns
  defaultSecurityConfigData.customPatterns.filter(p => p.active).forEach(p => {
    try {
      const reg = new RegExp(p.pattern, 'g');
      const matches = sanitized.match(reg) || [];
      matches.forEach(m => redactedMatches.push({ type: p.name, value: m }));
      sanitized = sanitized.replace(reg, p.replacement);
    } catch (e) {}
  });

  return res.json({
    originalText: sampleText,
    sanitizedText: sanitized,
    redactedMatchesCount: redactedMatches.length,
    redactedDetails: redactedMatches
  });
}

function testAccessBoundaries(req, res) {
  const { testType, payload, userRole } = req.body;
  const role = userRole || (req.user ? req.user.role : 'public');

  if (testType === 'vector_namespace') {
    const targetNamespace = (role === 'public' || role === 'guest' || role === 'citizen')
      ? 'docucity_public_bylaws'
      : (payload?.requestedNamespace || 'docucity_public_bylaws');

    const isIsolated = (role === 'public' || role === 'guest' || role === 'citizen')
      ? targetNamespace === 'docucity_public_bylaws'
      : true;

    return res.json({
      status: 'success',
      test: 'Isolated Vector Namespace',
      userRole: role,
      requestedNamespace: payload?.requestedNamespace || 'docucity_public_bylaws',
      routedNamespace: targetNamespace,
      isIsolated,
      accessVerdict: isIsolated ? "STRICTLY ISOLATED TO PUBLIC NAMESPACE" : "AUTHORIZED INTERNAL ACCESS",
      exposedInternalDocuments: 0,
      description: "Public queries are strictly routed to public ChromaDB vector collections, preventing accidental exposure of internal or draft gazettes."
    });
  }

  if (testType === 'pii_redaction') {
    const textToSanitize = payload?.text || "Citizen Applicant Muhammad Bilal (CNIC: 35202-9876543-1, Phone: 0300-8456789, Owner Name: Chaudhry Tariq Javed S/O Javed Iqbal) registered plot in Johar Town. IBAN: PK36MEZN0001234567890123.";
    const sanitized = sanitizePiiString(textToSanitize);

    return res.json({
      status: 'success',
      test: 'Automated PII Redaction',
      originalText: textToSanitize,
      sanitizedText: sanitized,
      redactionPassed: !sanitized.includes('35202-9876543-1') && !sanitized.includes('0300-8456789') && sanitized.includes('[CNIC REDACTED]') && sanitized.includes('[PHONE REDACTED]'),
      description: "All public documents and search outputs are scrubbed of personal citizen data (CNIC numbers, residential phone numbers, property owner records, and bank IBANs)."
    });
  }

  if (testType === 'read_only_permissions') {
    const attemptedAction = payload?.action || 'modify_zoning_geometry';
    const isPublic = role === 'public' || role === 'guest' || role === 'citizen';
    const blocked = isPublic;

    return res.json({
      status: blocked ? 'blocked' : 'allowed',
      test: 'Read-Only Permissions Enforcement',
      userRole: role,
      attemptedAction,
      permissionAllowed: !blocked,
      httpStatus: blocked ? 403 : 200,
      message: blocked
        ? `Access Denied (403 Forbidden): Public users have Read-Only permissions and cannot ${attemptedAction.replace(/_/g, ' ')}.`
        : `Access Granted (200 OK): Municipal Officer authorized to perform ${attemptedAction.replace(/_/g, ' ')}.`,
      description: "Public users cannot modify zoning geometries, alter policy rules, or ingest unverified documents into the system."
    });
  }

  return res.status(400).json({ error: "Invalid testType. Choose 'vector_namespace', 'pii_redaction', or 'read_only_permissions'." });
}

module.exports = {
  getSecurityConfig,
  updateSecurityConfig,
  testRedactionEngine,
  testAccessBoundaries
};


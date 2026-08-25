const mongoose = require('mongoose');
const { SecurityConfig, defaultSecurityConfigData } = require('../models/SecurityConfig');

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
  const { redactionRules, customPatterns } = req.body;
  const updatePayload = { updatedAt: new Date() };

  if (redactionRules) updatePayload.redactionRules = redactionRules;
  if (customPatterns) updatePayload.customPatterns = customPatterns;

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

  // Apply CNIC
  if (rules.cnicRedaction) {
    const cnicPattern = /\b\d{5}-\d{7}-\d{1}\b/g;
    const matches = sanitized.match(cnicPattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "CNIC", value: m }));
    sanitized = sanitized.replace(cnicPattern, "[CNIC REDACTED]");
  }

  // Apply Phone
  if (rules.phoneRedaction) {
    const phonePattern = /(\+92|0)?3\d{2}[-\s]?\d{7}\b/g;
    const matches = sanitized.match(phonePattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "PHONE", value: m }));
    sanitized = sanitized.replace(phonePattern, "[PHONE REDACTED]");
  }

  // Apply IBAN
  if (rules.ibanRedaction) {
    const ibanPattern = /PK\d{2}[A-Z]{4}\d{16}/g;
    const matches = sanitized.match(ibanPattern) || [];
    matches.forEach(m => redactedMatches.push({ type: "IBAN", value: m }));
    sanitized = sanitized.replace(ibanPattern, "[IBAN REDACTED]");
  }

  // Apply Active Custom Patterns
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

module.exports = { getSecurityConfig, updateSecurityConfig, testRedactionEngine };

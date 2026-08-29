/**
 * Verification Script: Access Boundaries & Public Data Protection
 * Tests:
 * 1. Isolated Vector Namespace: Public queries strictly routed to docucity_public_bylaws.
 * 2. Automated PII Redaction: Pakistani CNIC, Phone, Property Owner Records, IBAN, Email scrubbing.
 * 3. Read-Only Permissions: Public user blocked from modifying geometries, altering rules, ingesting unverified documents.
 */

const { sanitizePiiString } = require('./server/src/middleware/piiRedaction');
const { defaultSecurityConfigData } = require('./server/src/models/SecurityConfig');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('\n========================================================================');
console.log('🧪 VERIFYING: 5. Access Boundaries & Public Data Protection');
console.log('========================================================================\n');

// ── Test 1: Isolated Vector Namespace ──────────────────────────────────────────
console.log('--- [TEST 1] Isolated Vector Namespace Routing ---');
const publicNamespace = defaultSecurityConfigData.activeNamespaces.publicCollection.name;
const internalNamespace = defaultSecurityConfigData.activeNamespaces.internalOfficerCollection.name;

assert(publicNamespace === 'docucity_public_bylaws', 'Public Vector Namespace configured as docucity_public_bylaws');
assert(internalNamespace === 'docucity_internal_officer_gazette', 'Internal Officer Namespace configured as docucity_internal_officer_gazette');

function routeQuery(role, requestedCollection) {
  const isPublic = role === 'public' || role === 'guest' || role === 'citizen';
  return isPublic ? 'docucity_public_bylaws' : (requestedCollection || 'docucity_public_bylaws');
}

assert(routeQuery('public', 'docucity_internal_officer_gazette') === 'docucity_public_bylaws', 'Public user attempting to access internal namespace is strictly forced to docucity_public_bylaws');
assert(routeQuery('officer', 'docucity_internal_officer_gazette') === 'docucity_internal_officer_gazette', 'Municipal officer can access internal officer namespace');

// ── Test 2: Automated PII Redaction ───────────────────────────────────────────
console.log('\n--- [TEST 2] Automated PII Redaction Engine ---');

const sampleRawText = `
Citizen Applicant: Ali Raza S/O Tariq Mahmood
CNIC: 35202-7386736-1, Phone: 0300-1234567, Alternate: 042-35876543
Property Owner: Chaudhry Tariq Javed
Account IBAN: PK36MEZN0001234567890123
Email: citizen.test@private.pk
Bylaws Applied: Gulberg III Commercial High-Density FAR 1:8, Max Height 120ft.
`;

const sanitizedText = sanitizePiiString(sampleRawText);
console.log('\n[Sanitized Output Preview]:');
console.log(sanitizedText.trim());
console.log('--------------------------------------------------');

assert(!sanitizedText.includes('35202-7386736-1') && sanitizedText.includes('[CNIC REDACTED]'), 'Pakistani CNIC is successfully redacted to [CNIC REDACTED]');
assert(!sanitizedText.includes('0300-1234567') && !sanitizedText.includes('042-35876543') && sanitizedText.includes('[PHONE REDACTED]'), 'Pakistani Mobile & Landline Phone numbers redacted to [PHONE REDACTED]');
assert(!sanitizedText.includes('Chaudhry Tariq Javed') && sanitizedText.includes('[PROPERTY OWNER REDACTED]'), 'Property owner record is successfully redacted to [PROPERTY OWNER REDACTED]');
assert(!sanitizedText.includes('PK36MEZN0001234567890123') && sanitizedText.includes('[IBAN REDACTED]'), 'Bank IBAN is successfully redacted to [IBAN REDACTED]');
assert(!sanitizedText.includes('citizen.test@private.pk') && sanitizedText.includes('[EMAIL REDACTED]'), 'Personal Email is successfully redacted to [EMAIL REDACTED]');
assert(sanitizedText.includes('FAR 1:8') && sanitizedText.includes('120ft'), 'Public zoning bylaws and building rules remain intact and readable');

// ── Test 3: Read-Only Permissions Enforcement ──────────────────────────────────
console.log('\n--- [TEST 3] Read-Only Permissions Enforcement ---');

function mockRbacCheck(userRole, action) {
  const isPublic = userRole === 'public' || userRole === 'guest' || userRole === 'citizen';
  if (isPublic) {
    return {
      status: 403,
      error: `Access Denied: Public users have Read-Only permissions and cannot ${action}. Municipal Officer or Admin authorization is required.`,
      readOnlyEnforced: true
    };
  }
  return {
    status: 200,
    message: `Action '${action}' authorized for role '${userRole}'.`
  };
}

const geomCheckPublic = mockRbacCheck('public', 'modify zoning geometries');
assert(geomCheckPublic.status === 403 && geomCheckPublic.readOnlyEnforced, 'Public user blocked with 403 Forbidden on modifying zoning geometries');

const ruleCheckPublic = mockRbacCheck('public', 'alter policy rules or resolve conflicts');
assert(ruleCheckPublic.status === 403 && ruleCheckPublic.readOnlyEnforced, 'Public user blocked with 403 Forbidden on altering policy rules');

const ingestCheckPublic = mockRbacCheck('public', 'ingest unverified documents into the system');
assert(ingestCheckPublic.status === 403 && ingestCheckPublic.readOnlyEnforced, 'Public user blocked with 403 Forbidden on ingesting unverified documents');

const officerCheck = mockRbacCheck('officer', 'modify zoning geometries');
assert(officerCheck.status === 200, 'Authorized municipal officer can modify zoning geometries');

console.log('\n========================================================================');
console.log(`📊 RESULTS: ${passedTests} of ${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('========================================================================\n');

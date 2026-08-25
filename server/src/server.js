const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const sanitizePiiMiddleware = require('./middleware/piiRedaction');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const mapRoutes = require('./routes/mapRoutes');
const securityRoutes = require('./routes/securityRoutes');
const { seedInitialUsers } = require('./models/User');
const { seedInitialAuditAndErrors } = require('./models/DocumentAudit');
const { seedInitialSecurityConfig } = require('./models/SecurityConfig');
const { seedInitialPlatformConfig } = require('./models/PlatformConfig');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docucity';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizePiiMiddleware);

// MongoDB Database connection
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000
})
.then(async () => {
  console.log(`[DocuCity Gateway] Connected to MongoDB database at ${MONGODB_URI}`);
  await seedInitialUsers();
  await seedInitialAuditAndErrors();
  await seedInitialSecurityConfig();
  await seedInitialPlatformConfig();
  console.log(`[DocuCity Gateway] Populated all 5 MongoDB collections: users, securityconfigs, platformconfigs, documentaudits, pipelineerrors.`);
})
.catch((err) => {
  console.warn(`[DocuCity Gateway] MongoDB connection warning: ${err.message}. Operating with in-memory seed cache.`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/security', securityRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-fallback',
    service: 'DocuCity Lahore Node.js API Gateway (MongoDB Live Persistence Active)',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[DocuCity Gateway] Server listening on port ${PORT}`);
});

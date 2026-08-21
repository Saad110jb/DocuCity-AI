# DocuCity Lahore 🏛️ AI & GIS Municipal Platform

DocuCity Lahore is a full-stack AI-powered GIS and document intelligence platform tailored for Lahore municipal governance, LDA (Lahore Development Authority) building bylaws, land zoning regulations, and urban policy RAG (Retrieval-Augmented Generation) QA.

---

## 🏗️ Architecture Overview

```
docucity-lahore/
├── backend/                         # FastAPI Python Service (AI, OCR, RAG & GIS processing)
│   ├── app/
│   │   ├── api/v1/endpoints/       # Documents, RAG, Spatial & Admin Endpoints
│   │   ├── core/                    # Config & Security (PII/CNIC Redaction)
│   │   ├── services/                # OCR, NER, Geocoding, RAG & ChromaDB Vector Store
│   │   ├── schemas/                 # Pydantic Schemas
│   │   └── main.py                  # FastAPI Entry Point
│   ├── requirements.txt
│   └── Dockerfile
│
├── server/                          # Node.js / Express API Gateway & Orchestrator
│   ├── src/
│   │   ├── controllers/             # Auth, Upload & Proxy Controllers
│   │   ├── middleware/              # JWT Auth & PII Redaction Middleware
│   │   ├── routes/                  # Auth, Document & Map Routes
│   │   ├── models/                  # User Accounts & Document Audit Trail
│   │   └── server.js                # Express Entry Point
│   ├── package.json
│   └── Dockerfile
│
├── client/                          # React + Vite + Tailwind + Leaflet Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/                 # Leaflet GIS Map, GeoJSON Overlay & Tooltips
│   │   │   ├── chat/                # RAG AI Drawer, Citations & Language Switch
│   │   │   └── admin/               # PDF Upload Modal & Entity Review Table
│   │   ├── pages/                   # GIS Dashboard & Municipal Officer Portal
│   │   ├── hooks/                   # Custom Hooks for Map & RAG Queries
│   │   └── styles/                  # Tailwind CSS Design System
│   ├── package.json
│   └── Dockerfile
│
├── data/                            # Local vector & geo storage mounts
│   ├── chromadb/                    # ChromaDB Persistent Vector Storage
│   └── geojson/                     # Lahore Spatial Polygon Layers
│
├── docker-compose.yml               # Multi-container orchestration
└── README.md
```

---

## 🌟 Key Features

1. **Interactive Lahore GIS Map**: Powered by Leaflet.js with dark-themed basemaps and interactive polygon overlays for **Gulberg Commercial**, **Johar Town Residential**, **Model Town**, and **Mall Road Heritage** zones.
2. **AI RAG Assistant (Google Gemini 2.5)**: Natural language question answering for LDA Floor Area Ratio (FAR), height restrictions, and setback rules with document clause citations.
3. **Bilingual English / Urdu Switch**: Instant query context toggle supporting Urdu (اردو) responses.
4. **OCR & NER Bylaw Extraction**: Automatically extracts FAR (1:8, 1:4), maximum height (ft/m), setbacks, and zone codes from uploaded PDF Gazettes.
5. **PII & CNIC Redaction**: Sanitizes 13-digit Pakistani CNIC numbers (`35202-XXXXXXX-X`) and phone numbers for regulatory privacy.
6. **Municipal Officer Portal**: PDF document upload dropzone, entity verification workflows, and audit trail logs.

---

## 🚀 Quickstart & Setup

### Option 1: Run via Docker Compose (Recommended)

```bash
# Clone and launch all containers (Backend, Gateway, Client)
docker-compose up --build
```

Access services at:
- **React Client**: `http://localhost:3000`
- **Node API Gateway**: `http://localhost:5000`
- **FastAPI AI Service**: `http://localhost:8000/docs`

---

### Option 2: Running Locally (Development Mode)

#### 1. Start Python FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Start Node.js API Gateway
```bash
cd server
npm install
npm run dev
```

#### 3. Start React Frontend
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔐 Credentials & Environment Variables

- **Demo Officer Login**: `officer@lda.gop.pk` / `officer123`
- **Gemini API Key (Optional)**: Configure `GEMINI_API_KEY` in `backend/.env` for live Google Gemini LLM responses. If omitted, the system seamlessly operates in offline mode with pre-seeded LDA bylaws and fallback embeddings.

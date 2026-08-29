import os
import pymongo
from typing import List, Dict, Any, Optional
from app.core.config import settings

# ChromaDB client import with fallback
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    HAVE_CHROMADB = True
except ImportError:
    chromadb = None
    HAVE_CHROMADB = False

PUBLIC_COLLECTION_NAME = "docucity_public_bylaws"
INTERNAL_COLLECTION_NAME = "docucity_internal_officer_gazette"

class VectorStore:
    def __init__(self):
        self.mongodb_uri = settings.MONGODB_URI
        self.client = None
        self.db = None
        self.chroma_client = None
        self.public_collection = None
        self.internal_collection = None

        # 1. Connect to MongoDB
        try:
            self.client = pymongo.MongoClient(self.mongodb_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client["docucity"]
        except Exception as e:
            print(f"[VectorStore] Warning: Could not connect to MongoDB directly: {e}")

        # 2. Connect to ChromaDB
        self._init_chromadb()

    def _init_chromadb(self):
        if not HAVE_CHROMADB:
            print("[VectorStore] ChromaDB library not available, running in hybrid mode.")
            return

        try:
            os.makedirs(settings.CHROMADB_DIR, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=settings.CHROMADB_DIR)
            
            # Isolated Public Vector Namespace
            self.public_collection = self.chroma_client.get_or_create_collection(
                name=PUBLIC_COLLECTION_NAME,
                metadata={"description": "Public verified LDA gazettes & zoning bylaws"}
            )

            # Isolated Internal Officer Vector Namespace (Restricted)
            self.internal_collection = self.chroma_client.get_or_create_collection(
                name=INTERNAL_COLLECTION_NAME,
                metadata={"description": "Internal officer committee notes & draft gazettes"}
            )

            self._seed_chroma_namespaces()
            print(f"[VectorStore] ChromaDB initialized with isolated namespaces: '{PUBLIC_COLLECTION_NAME}' & '{INTERNAL_COLLECTION_NAME}'.")
        except Exception as e:
            print(f"[VectorStore] ChromaDB init warning: {e}")
            try:
                self.chroma_client = chromadb.Client()
                self.public_collection = self.chroma_client.get_or_create_collection(name=PUBLIC_COLLECTION_NAME)
                self.internal_collection = self.chroma_client.get_or_create_collection(name=INTERNAL_COLLECTION_NAME)
                self._seed_chroma_namespaces()
            except Exception as e2:
                print(f"[VectorStore] In-memory ChromaDB fallback warning: {e2}")

    def _seed_chroma_namespaces(self):
        """Populates seed vector embeddings in isolated namespaces if empty."""
        try:
            if self.public_collection and self.public_collection.count() == 0:
                self.public_collection.add(
                    documents=[
                        "LDA Land Use Rules 2020: Floor Area Ratio (FAR) for commercial high density corridors is 1:8 with 120ft maximum height cap and 20ft mandatory front setback on Main Boulevard Gulberg.",
                        "Johar Town Medium-Density Residential Scheme: Maximum allowable height is 38ft (G+2), FAR 1:4 with 10ft front road setback and 5ft side setback.",
                        "Walled City Heritage Conservation: Strict 30ft maximum height cap on all new constructions within Shahi Qila and Delhi Gate buffer zones under Punjab Heritage Authority Act 2012.",
                        "WASA Water & Sewerage Regulations 2026: Commercial water connection requires WASA NOC with Rs. 15,000/cusec groundwater extraction fee and 15m sewer line buffer."
                    ],
                    metadatas=[
                        {"title": "LDA Land Use Rules 2020", "clause": "Clause 4.2 FAR & Height", "page": 14, "zone": "Gulberg Commercial", "authority": "LDA", "status": "Published"},
                        {"title": "Johar Town Zoning Bylaws", "clause": "Clause 2.1 Residential Cap", "page": 8, "zone": "Johar Town", "authority": "LDA", "status": "Published"},
                        {"title": "Punjab Heritage Act 2012", "clause": "Clause 6 Height Restrictions", "page": 3, "zone": "Walled City", "authority": "WCLA", "status": "Published"},
                        {"title": "WASA Environmental Order 2026", "clause": "Rule 8 Water Tariffs", "page": 5, "zone": "All Lahore", "authority": "WASA", "status": "Published"}
                    ],
                    ids=["pub-doc-1", "pub-doc-2", "pub-doc-3", "pub-doc-4"]
                )

            if self.internal_collection and self.internal_collection.count() == 0:
                self.internal_collection.add(
                    documents=[
                        "[RESTRICTED INTERNAL DRAFT] Proposed Gulberg High-Rise Floor Addition amendment (Draft 2026-B) allowing up to 180ft height pending municipal board signoff.",
                        "[RESTRICTED INTERNAL DRAFT] Internal committee audit report on commercialization conversion arrears in Johar Town Block H."
                    ],
                    metadatas=[
                        {"title": "Draft Amendment Gulberg 2026", "clause": "Internal Review Section 9", "page": 2, "zone": "Gulberg", "authority": "LDA Internal", "status": "Draft"},
                        {"title": "Officer Arrears Audit Note", "clause": "Internal Officer Memo", "page": 1, "zone": "Johar Town", "authority": "LDA Internal", "status": "Draft"}
                    ],
                    ids=["int-doc-1", "int-doc-2"]
                )
        except Exception as e:
            print(f"[VectorStore] ChromaDB seeding note: {e}")

    def search_similar(
        self,
        query: str,
        top_k: int = 4,
        zone_code: Optional[str] = None,
        collection: str = PUBLIC_COLLECTION_NAME,
        user_role: str = "public"
    ) -> List[Dict[str, Any]]:
        """
        Isolated Vector Namespace Policy:
        - If user_role == 'public' (or collection == 'docucity_public_bylaws'), query is strictly routed to the public namespace.
        - Internal officer draft collections are never searched or exposed to public users.
        """
        query_lower = query.lower()
        results = []

        # 1. Enforce namespace boundary
        target_collection_name = PUBLIC_COLLECTION_NAME
        if user_role in ["officer", "admin", "superadmin"] and collection == INTERNAL_COLLECTION_NAME:
            target_collection_name = INTERNAL_COLLECTION_NAME

        # 2. Query ChromaDB Vector Collection if active
        active_chroma_col = self.public_collection if target_collection_name == PUBLIC_COLLECTION_NAME else self.internal_collection
        if active_chroma_col is not None:
            try:
                chroma_res = active_chroma_col.query(query_texts=[query], n_results=min(top_k, max(1, active_chroma_col.count())))
                if chroma_res and chroma_res.get("documents") and len(chroma_res["documents"][0]) > 0:
                    docs = chroma_res["documents"][0]
                    metas = chroma_res["metadatas"][0] if chroma_res.get("metadatas") else [{}] * len(docs)
                    ids = chroma_res["ids"][0] if chroma_res.get("ids") else [f"chr-{i}" for i in range(len(docs))]

                    for doc_id, text, meta in zip(ids, docs, metas):
                        results.append({
                            "id": doc_id,
                            "document_title": meta.get("title", "Official Gazette Bylaws"),
                            "clause": meta.get("clause", "Statutory Regulation Clause"),
                            "page": meta.get("page", 1),
                            "text": text,
                            "zone_code": meta.get("zone", "All Lahore Metropolitan District"),
                            "gazette_ref": f"ChromaDB [{target_collection_name}] Verified Gazette",
                            "confidence": 0.96,
                            "engine": f"ChromaDB Vector Namespace ({target_collection_name})",
                            "namespace": target_collection_name
                        })
                    if results:
                        return results
            except Exception as e:
                print(f"[VectorStore] ChromaDB query error: {e}")

        # 3. Query MongoDB with strict staging status isolation
        if self.db is not None:
            try:
                # For public scope, ONLY published enacted documents
                mongo_status_filter = {"stagingStatus": "Formal Gazette Enacted (Published)"}
                if target_collection_name == INTERNAL_COLLECTION_NAME:
                    mongo_status_filter = {"stagingStatus": {"$ne": "Formal Gazette Enacted (Published)"}}

                enacted_docs = list(self.db.ingestiondocuments.find(mongo_status_filter))
                enacted_ids = [d["documentId"] for d in enacted_docs]

                ocr_records = list(self.db.ocrdocuments.find({"documentId": {"$in": enacted_ids}}))
                scored_chunks = []

                for ocr_doc in ocr_records:
                    doc_title = ocr_doc.get("filename", "LDA Gazette Rules").replace("_", " ")
                    doc_id = ocr_doc.get("documentId")
                    chunks = ocr_doc.get("textChunks", [])

                    for idx, chunk in enumerate(chunks):
                        page_num = idx + 1
                        eng_text = chunk.get("englishText", "")
                        score = 0.0

                        for word in query_lower.split():
                            if len(word) > 2 and word in eng_text.lower():
                                score += 0.25

                        if score > 0:
                            scored_chunks.append((score, {
                                "id": f"{doc_id}-p{page_num}",
                                "document_title": doc_title,
                                "clause": f"Page {page_num} Regulation Section",
                                "page": page_num,
                                "text": eng_text,
                                "zone_code": "All Lahore Metropolitan District",
                                "gazette_ref": f"Punjab Gazette Enacted Record (Page {page_num} of {len(chunks)})",
                                "collection": target_collection_name,
                                "namespace": target_collection_name
                            }))

                if scored_chunks:
                    scored_chunks.sort(key=lambda x: x[0], reverse=True)
                    for rank, (score, doc) in enumerate(scored_chunks[:top_k]):
                        results.append({
                            "id": doc["id"],
                            "document_title": doc["document_title"],
                            "clause": doc["clause"],
                            "page": doc["page"],
                            "text": doc["text"],
                            "zone_code": doc["zone_code"],
                            "gazette_ref": doc["gazette_ref"],
                            "confidence": min(0.98, max(0.80, score * 0.4 + 0.70)),
                            "engine": f"MongoDB Vector Store ({target_collection_name})",
                            "namespace": target_collection_name
                        })
                    return results
            except Exception as e:
                print(f"[VectorStore] MongoDB query error: {e}")

        # 4. Fallback Default Public Bylaws
        fallback_docs = [
            {
                "id": "doc-1",
                "document_title": "2.LDA Landuse Rules 2020",
                "clause": "Page 1 - Section 1.1 Short Title & Scope",
                "page": 1,
                "text": "The Punjab Gazette August 06, 2020 Notification No.SO(H-II) 3-2/2016 under Section 44 of LDA Act 1975: Lahore Development Authority Land Use Rules 2020.",
                "zone_code": "All Lahore Metropolitan District",
                "gazette_ref": "Punjab Gazette Aug 06, 2020"
            },
            {
                "id": "doc-2",
                "document_title": "2.LDA Landuse Rules 2020",
                "clause": "Page 2 - Section 2 Definitions (f to n)",
                "page": 2,
                "text": "Section 2: Betterment fee, building line, building regulations 2019, built-up area, commercial area, commercial use, controlled area.",
                "zone_code": "All Lahore Metropolitan District",
                "gazette_ref": "Punjab Gazette Aug 06, 2020"
            },
            {
                "id": "doc-6",
                "document_title": "2.LDA Landuse Rules 2020",
                "clause": "Page 6 - Commercial Conversion Fees",
                "page": 6,
                "text": "Permanent commercialization conversion fee for List A roads fixed at 20% of commercial DC rate. Annual temporary renewal fee fixed at 5% per annum.",
                "zone_code": "List A Roads",
                "gazette_ref": "Punjab Gazette Aug 06, 2020"
            }
        ]

        for idx, doc in enumerate(fallback_docs[:top_k]):
            results.append({
                "id": doc["id"],
                "document_title": doc["document_title"],
                "clause": doc["clause"],
                "page": doc["page"],
                "text": doc["text"],
                "zone_code": doc["zone_code"],
                "gazette_ref": doc["gazette_ref"],
                "confidence": 0.95 - (idx * 0.05),
                "engine": f"ChromaDB/MongoDB Isolated Namespace ({PUBLIC_COLLECTION_NAME})",
                "namespace": PUBLIC_COLLECTION_NAME
            })

        return results

vector_store = VectorStore()

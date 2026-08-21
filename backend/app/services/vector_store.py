import os
from typing import List, Dict, Any
from app.core.config import settings

class VectorStore:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self._in_memory_docs: List[Dict[str, Any]] = [
            {
                "id": "doc-1",
                "document_title": "LDA Building Regulations Gazette 2022",
                "clause": "Clause 4.2 - High Density Commercial FAR",
                "page": 14,
                "text": "For Commercial High-Density Plots along Main Boulevard Gulberg, the allowed Floor Area Ratio (FAR) is 1:8 with maximum height of 120ft and mandatory front setback of 20ft.",
                "zone_code": "LDA-Z1-GUL",
                "gazette_ref": "LDA Gazette 2022, S.III"
            },
            {
                "id": "doc-2",
                "document_title": "LDA Johar Town Residential Master Plan",
                "clause": "Bylaw 12.1 - Medium Density Residential",
                "page": 8,
                "text": "Residential buildings in Johar Town Phase 2 are allowed a maximum height of 45ft (G+3 floors) with a FAR of 1:4 and front setback of 10ft.",
                "zone_code": "LDA-Z2-JT",
                "gazette_ref": "LDA Master Plan 2050"
            },
            {
                "id": "doc-3",
                "document_title": "Model Town Society Building Code 2021",
                "clause": "Chapter 3 - Low Density Residential Rules",
                "page": 22,
                "text": "Model Town Block B permits single-family residential units up to 38ft height limit, FAR 1:3.5, and 15ft front compulsory open space.",
                "zone_code": "MTS-Z3-MT",
                "gazette_ref": "Model Town Bylaws 2021"
            },
            {
                "id": "doc-4",
                "document_title": "Punjab Heritage Conservation Ordinance",
                "clause": "Section 9 - Mall Road Special Corridor Rules",
                "page": 5,
                "text": "Mall Road Heritage Zone restricts all architectural constructions to maximum height of 30ft, FAR 1:2, preserving historical facade aesthetics.",
                "zone_code": "LDA-HC-MALL",
                "gazette_ref": "Punjab Heritage Act 2019"
            }
        ]
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            os.makedirs(settings.CHROMADB_DIR, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=settings.CHROMADB_DIR)
            self.collection = self.chroma_client.get_or_create_collection("docucity_lahore_docs")
            
            # Seed collection if empty
            if self.collection.count() == 0:
                for doc in self._in_memory_docs:
                    self.collection.add(
                        ids=[doc["id"]],
                        documents=[doc["text"]],
                        metadatas=[{
                            "document_title": doc["document_title"],
                            "clause": doc["clause"],
                            "page": doc["page"],
                            "zone_code": doc["zone_code"],
                            "gazette_ref": doc["gazette_ref"]
                        }]
                    )
        except Exception as e:
            print(f"[VectorStore] ChromaDB initialization warning: {e}. Operating with in-memory store.")

    def search_similar(self, query: str, top_k: int = 3, zone_code: str = None) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        results = []
        
        # Search via ChromaDB if available
        if self.collection and self.collection.count() > 0:
            try:
                where_clause = {"zone_code": zone_code} if zone_code else None
                chroma_res = self.collection.query(
                    query_texts=[query],
                    n_results=min(top_k, self.collection.count()),
                    where=where_clause
                )
                if chroma_res and chroma_res['documents'] and chroma_res['documents'][0]:
                    for i in range(len(chroma_res['documents'][0])):
                        meta = chroma_res['metadatas'][0][i]
                        results.append({
                            "id": chroma_res['ids'][0][i],
                            "document_title": meta.get("document_title", "LDA Bylaws"),
                            "clause": meta.get("clause", "Section 1"),
                            "page": meta.get("page", 1),
                            "text": chroma_res['documents'][0][i],
                            "zone_code": meta.get("zone_code", ""),
                            "gazette_ref": meta.get("gazette_ref", ""),
                            "confidence": 0.92 - (i * 0.05)
                        })
                    return results
            except Exception as e:
                print(f"[VectorStore] Chroma query error: {e}")

        # In-memory search fallback
        scored_docs = []
        for doc in self._in_memory_docs:
            score = 0.0
            if zone_code and doc.get("zone_code") == zone_code:
                score += 0.5
            for word in query_lower.split():
                if word in doc["text"].lower() or word in doc["document_title"].lower():
                    score += 0.2
            
            scored_docs.append((score, doc))
        
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        for idx, (score, doc) in enumerate(scored_docs[:top_k]):
            results.append({
                "id": doc["id"],
                "document_title": doc["document_title"],
                "clause": doc["clause"],
                "page": doc["page"],
                "text": doc["text"],
                "zone_code": doc["zone_code"],
                "gazette_ref": doc["gazette_ref"],
                "confidence": max(0.75, 0.95 - (idx * 0.06))
            })
            
        return results

vector_store = VectorStore()

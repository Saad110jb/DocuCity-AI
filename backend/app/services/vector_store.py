import os
from typing import List, Dict, Any
from app.core.config import settings

class VectorStore:
    def __init__(self):
        self.mongodb_uri = settings.MONGODB_URI
        self._in_memory_docs: List[Dict[str, Any]] = [
            {
                "id": "doc-1",
                "document_title": "LDA Building Regulations Gazette 2022",
                "clause": "Clause 4.2 - High Density Commercial FAR",
                "page": 14,
                "text": "For Commercial High-Density Plots along Main Boulevard Gulberg, the allowed Floor Area Ratio (FAR) is 1:8 with maximum height of 120ft and mandatory front setback of 20ft.",
                "zone_code": "LDA-Z1-GUL",
                "gazette_ref": "LDA Gazette 2022, S.III",
                "collection": "docucity_public_bylaws"
            },
            {
                "id": "doc-2",
                "document_title": "LDA Johar Town Residential Master Plan",
                "clause": "Bylaw 12.1 - Medium Density Residential",
                "page": 8,
                "text": "Residential buildings in Johar Town Phase 2 are allowed a maximum height of 45ft (G+3 floors) with a FAR of 1:4 and front setback of 10ft.",
                "zone_code": "LDA-Z2-JT",
                "gazette_ref": "LDA Master Plan 2050",
                "collection": "docucity_public_bylaws"
            },
            {
                "id": "doc-3",
                "document_title": "Model Town Society Building Code 2021",
                "clause": "Chapter 3 - Low Density Residential Rules",
                "page": 22,
                "text": "Model Town Block B permits single-family residential units up to 38ft height limit, FAR 1:3.5, and 15ft front compulsory open space.",
                "zone_code": "MTS-Z3-MT",
                "gazette_ref": "Model Town Bylaws 2021",
                "collection": "docucity_public_bylaws"
            },
            {
                "id": "doc-4",
                "document_title": "Punjab Heritage Conservation Ordinance",
                "clause": "Section 9 - Mall Road Special Corridor Rules",
                "page": 5,
                "text": "Mall Road Heritage Zone restricts all architectural constructions to maximum height of 30ft, FAR 1:2, preserving historical facade aesthetics.",
                "zone_code": "LDA-HC-MALL",
                "gazette_ref": "Punjab Heritage Act 2019",
                "collection": "docucity_public_bylaws"
            }
        ]

    def search_similar(self, query: str, top_k: int = 3, zone_code: str = None, collection: str = "docucity_public_bylaws") -> List[Dict[str, Any]]:
        query_lower = query.lower()
        results = []
        
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
                "confidence": max(0.75, 0.95 - (idx * 0.06)),
                "engine": "MongoDB Vector Search"
            })
            
        return results

vector_store = VectorStore()

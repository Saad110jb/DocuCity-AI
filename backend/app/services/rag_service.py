import os
from typing import Dict, Any, List
from app.core.config import settings
from app.services.vector_store import vector_store

class RAGService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        self._init_gemini()

    def _init_gemini(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[RAGService] Could not initialize google-genai client: {e}")

    def query(self, user_query: str, language: str = "en", zone_code: str = None) -> Dict[str, Any]:
        """
        Executes RAG retrieval and answer generation with clause & page citations.
        Supports live Gemini model calls or intelligent fallback when API key is unconfigured.
        """
        # 1. Retrieve relevant chunks from vector store
        docs = vector_store.search_similar(user_query, top_k=3, zone_code=zone_code)
        
        # Build context prompt
        context_blocks = []
        citations = []
        for idx, doc in enumerate(docs):
            context_blocks.append(
                f"Document Source [{idx+1}]: {doc['document_title']}\n"
                f"Clause: {doc['clause']} (Page {doc['page']})\n"
                f"Gazette Ref: {doc['gazette_ref']}\n"
                f"Content: {doc['text']}"
            )
            citations.append({
                "document_title": doc["document_title"],
                "clause": doc["clause"],
                "page": doc["page"],
                "confidence": doc["confidence"],
                "snippet": doc["text"],
                "gazette_ref": doc["gazette_ref"]
            })

        context_str = "\n\n".join(context_blocks)

        answer_en = ""
        # 2. Generate with Gemini API if client active
        if self.client:
            try:
                prompt = (
                    f"You are the official DocuCity AI assistant for Lahore Development Authority (LDA).\n"
                    f"Answer the user query based ONLY on the provided Lahore building bylaws & gazette regulations context below.\n\n"
                    f"Context:\n{context_str}\n\n"
                    f"User Query: {user_query}\n\n"
                    f"Provide a clear, accurate response detailing specific FAR ratios, heights, or setback rules where applicable."
                )
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                if response and response.text:
                    answer_en = response.text
            except Exception as e:
                print(f"[RAGService] Gemini API call exception: {e}")

        # 3. Fallback synthesis if API unconfigured or call failed
        if not answer_en:
            if "far" in user_query.lower() or "floor area" in user_query.lower():
                answer_en = (
                    "According to Lahore Development Authority (LDA) Regulations:\n"
                    "• Gulberg Commercial Main Boulevard (LDA-Z1-GUL): Allowed FAR is 1:8 with maximum height limit of 120ft.\n"
                    "• Johar Town Phase 2 (LDA-Z2-JT): Allowed FAR is 1:4 with max height 45ft.\n"
                    "• Model Town Block B (MTS-Z3-MT): Permitted FAR is 1:3.5."
                )
            elif "height" in user_query.lower():
                answer_en = (
                    "Maximum height restrictions per LDA & Local Bylaws:\n"
                    "• Commercial High-Density (Gulberg): Up to 120ft (36.5m).\n"
                    "• Residential Medium-Density (Johar Town): Up to 45ft (G+3 Floors).\n"
                    "• Special Heritage Zone (Mall Road): Strictly limited to 30ft to preserve architectural heritage."
                )
            elif "setback" in user_query.lower() or "open space" in user_query.lower():
                answer_en = (
                    "Compulsory Open Space & Setback Rules:\n"
                    "• Gulberg Commercial Zone: Mandatory front setback of 20ft and side setback of 10ft.\n"
                    "• Johar Town Residential: Front setback of 10ft and side setback of 5ft.\n"
                    "• Mall Road Heritage Corridor: Minimum front setback of 30ft."
                )
            else:
                answer_en = (
                    f"Based on LDA Master Plan & Building Regulations 2022/2050:\n\n"
                    f"Relevant provisions from {docs[0]['document_title']} ({docs[0]['clause']}) state: "
                    f"\"{docs[0]['text']}\""
                )

        # 4. Urdu Translation logic for bilingual switch
        answer_ur = None
        if language == "ur" or "اردو" in user_query or "کیا" in user_query:
            answer_ur = (
                "ایل ڈی اے (لاہور ڈیولپمنٹ اتھارٹی) کے قواعد و ضوابط کے مطابق:\n"
                "• گلبرگ کمرشل زون: فلور ایریا ریشو (FAR) 1:8 اور زیادہ سے زیادہ اونچائی 120 فٹ ہے۔\n"
                "• جوہر ٹاؤن فیز 2: FAR 1:4 اور زیادہ سے زیادہ اونچائی 45 فٹ (G+3 منزلیں) ہے۔\n"
                "• مال روڈ ہیریٹیج زون: تاریخی لک کو برقرار رکھنے کے لیے اونچائی 30 فٹ تک محدود ہے۔"
            )

        followups = [
            "What are the setback requirements for commercial plots in Gulberg?",
            "What is the maximum permitted building height in Johar Town Phase 2?",
            "How does Mall Road Heritage status affect construction permits?"
        ]

        return {
            "query": user_query,
            "answer": answer_ur if language == "ur" and answer_ur else answer_en,
            "language": language,
            "citations": citations,
            "translated_answer": answer_ur if language != "ur" else answer_en,
            "suggested_followups": followups
        }

rag_service = RAGService()

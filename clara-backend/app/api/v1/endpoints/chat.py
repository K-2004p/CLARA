from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.session import get_db
from app.db.models import Document, Clause, AIChat
from app.services.rag_service import rag_service
from app.services.adaptive_learning import adaptive_learning_service
from app.services.language_service import language_service

router = APIRouter()

@router.post("/chat")
def chat_document(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    RAG-grounded contextual AI chat endpoint. Allows users to ask follow-up questions
    about any analyzed document.
    """
    doc_id = payload.get("documentId")
    query = payload.get("query") or payload.get("message")

    if not query:
        raise HTTPException(status_code=400, detail="Query string is required.")

    # Retrieve document from database if available
    db_doc = None
    clauses_dict = []
    if doc_id:
        db_doc = db.query(Document).filter(Document.id == doc_id).first()
        if db_doc:
            clauses = db.query(Clause).filter(Clause.document_id == doc_id).all()
            clauses_dict = [
                {
                    "id": c.id.split("-")[-1] if "-" in c.id else c.id,
                    "sectionHeading": c.section_heading,
                    "text": c.text
                }
                for c in clauses
            ]

    # Fallback to contextText if doc_id not found
    context_text = payload.get("contextText", "")
    language = language_service.normalize_language(payload.get("language", "English"))
    detected_message_language = language_service.detect_language(query, language)
    
    if not clauses_dict and context_text:
        clauses_dict = [{"id": "clause-1", "sectionHeading": "Document Context", "text": context_text}]
    elif not clauses_dict:
        clauses_dict = [{"id": "clause-1", "sectionHeading": "General Context", "text": "Standard agreement parameters and terms."}]

    chat_res = rag_service.query_chat(
        doc_id=doc_id or "default",
        document_text=db_doc.raw_text if db_doc else context_text,
        clauses=clauses_dict,
        user_query=query,
        language=language,
        detected_message_language=detected_message_language
    )

    if doc_id and db_doc:
        db_chat = AIChat(
            document_id=doc_id,
            user_query=query,
            ai_response=chat_res["aiResponse"],
            cited_clauses=chat_res["citedClauses"]
        )
        db.add(db_chat)
        db.commit()

    return chat_res

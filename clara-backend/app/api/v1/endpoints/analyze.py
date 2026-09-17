import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.db.session import get_db
from app.db.models import Document, Clause, RiskReport
from app.services.segmenter import ClauseSegmenter
from app.services.risk_engine import RiskEngine
from app.services.rag_service import rag_service
from app.services.language_service import language_service

router = APIRouter()

@router.post("/analyze")
def analyze_document(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Analyzes document text or HTML DOM content, segments clauses, evaluates legal risks,
    indexes vectors for RAG, stores in DB, and returns structured risk analysis JSON.
    """
    text = payload.get("text") or payload.get("rawText") or payload.get("html", "")
    url = payload.get("url", "")
    title = payload.get("title", "Legal Document / Contract")
    language = language_service.normalize_language(payload.get("language", "English"))
    detected_language = language_service.detect_language(text, language)

    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text content too short or empty for analysis.")

    doc_id = str(uuid.uuid4())[:12]

    # Step 1: Segment clauses
    segmented_clauses = ClauseSegmenter.segment(text)
    if not segmented_clauses:
        raise HTTPException(status_code=422, detail="Failed to segment text into legal clauses.")

    # Step 2: Risk Evaluation Engine
    options = payload.get("options", {})
    analysis_result = RiskEngine.evaluate(segmented_clauses, language=language, options=options)
    analysis_result["languageProfile"] = language_service.build_language_profile(text, language)
    analysis_result["detectedLanguage"] = detected_language
    analysis_result["summary"] = language_service.localize_text(analysis_result["summary"], language)
    analysis_result["recommendation"] = language_service.localize_text(analysis_result["recommendation"], language)
    analysis_result["pros"] = [language_service.localize_text(item, language) for item in analysis_result["pros"]]
    analysis_result["cons"] = [language_service.localize_text(item, language) for item in analysis_result["cons"]]
    analysis_result["clauses"] = [
        {
            **clause,
            "explanation": language_service.localize_text(clause.get("explanation", ""), language),
            "recommendation": language_service.localize_text(clause.get("recommendation", ""), language)
        }
        for clause in analysis_result["clauses"]
    ]

    # Step 3: Index in RAG service
    rag_service.index_document(doc_id, analysis_result["clauses"])

    # Step 4: Persist in database
    db_doc = Document(
        id=doc_id,
        title=title,
        url=url,
        doc_type="Legal Agreement",
        raw_text=text[:10000] # Cap raw text for DB
    )
    db.add(db_doc)

    for c in analysis_result["clauses"]:
        db_clause = Clause(
            id=f"{doc_id}-{c['id']}",
            document_id=doc_id,
            section_heading=c.get("sectionHeading"),
            text=c["text"],
            category=c["category"],
            risk_level=c["riskLevel"],
            risk_score=float(c["riskScore"]),
            is_hidden=c["isHidden"],
            explanation=c["explanation"],
            recommendation=c["recommendation"],
            order_index=c["orderIndex"]
        )
        db.add(db_clause)

    db_report = RiskReport(
        id=f"rep-{doc_id}",
        document_id=doc_id,
        summary=analysis_result["summary"],
        overall_risk=analysis_result["overallRisk"],
        recommendation=analysis_result["recommendation"],
        trust_score=analysis_result["trustScore"],
        transparency_score=analysis_result["transparencyScore"],
        privacy_score=analysis_result["privacyScore"],
        financial_risk=analysis_result["financialRisk"],
        compliance_risk=analysis_result["complianceRisk"],
        confidence=analysis_result["confidence"],
        pros=analysis_result["pros"],
        cons=analysis_result["cons"],
        graph_data=analysis_result["graphData"],
        hidden_clauses=analysis_result["hiddenClauses"],
        risk_categories=analysis_result["riskCategories"]
    )
    db.add(db_report)
    db.commit()

    # Include documentId in output response
    analysis_result["documentId"] = doc_id
    return analysis_result

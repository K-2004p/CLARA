from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_db
from app.db.models import Document, RiskReport

router = APIRouter()

@router.get("/history")
def get_analysis_history(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Returns history of analyzed documents with summary risk scores.
    """
    docs = db.query(Document).order_by(Document.created_at.desc()).limit(limit).all()
    history = []

    for d in docs:
        rep = db.query(RiskReport).filter(RiskReport.document_id == d.id).first()
        history.append({
            "id": d.id,
            "title": d.title,
            "url": d.url,
            "createdAt": d.created_at.isoformat(),
            "overallRisk": rep.overall_risk if rep else 50,
            "recommendation": rep.recommendation if rep else "Proceed Carefully",
            "trustScore": rep.trust_score if rep else 70,
            "privacyScore": rep.privacy_score if rep else 75
        })

    return {"history": history, "total": len(history)}

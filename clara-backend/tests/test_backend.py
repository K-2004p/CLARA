import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.segmenter import ClauseSegmenter
from app.services.risk_engine import RiskEngine

client = TestClient(app)

def test_clause_segmentation():
    sample_text = """
    Section 1. Mandatory Arbitration.
    All claims shall be resolved by binding arbitration.

    Section 2. Automatic Renewal.
    Subscriptions automatically renew each month.
    """
    clauses = ClauseSegmenter.segment(sample_text)
    assert len(clauses) >= 2
    assert "Arbitration" in clauses[0]["text"] or "Arbitration" in clauses[0]["sectionHeading"]

def test_risk_engine_evaluation():
    clauses = [
        {
            "id": "c-1",
            "sectionHeading": "Dispute Resolution",
            "text": "You agree to mandatory binding arbitration and waive class action lawsuits.",
            "orderIndex": 1
        },
        {
            "id": "c-2",
            "sectionHeading": "Billing",
            "text": "Your account automatically renews each month unless cancelled 48 hours prior.",
            "orderIndex": 2
        }
    ]
    res = RiskEngine.evaluate(clauses)
    assert "overallRisk" in res
    assert "recommendation" in res
    assert "privacyScore" in res
    assert "financialRisk" in res
    assert "complianceRisk" in res
    assert "trustScore" in res
    assert "transparencyScore" in res
    assert "graphData" in res
    assert res["overallRisk"] > 40
    assert len(res["hiddenClauses"]) > 0

def test_analyze_api_endpoint():
    payload = {
        "text": "1. Mandatory binding arbitration clause. 2. We automatically renew your plan and sell personal data to third parties.",
        "title": "Test Agreement",
        "url": "https://test.com/terms"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "overallRisk" in data
    assert "recommendation" in data
    assert "clauses" in data
    assert len(data["clauses"]) > 0

def test_chat_api_endpoint():
    payload = {
        "documentId": "test-doc",
        "query": "Can I cancel my subscription anytime?",
        "contextText": "Subscriptions automatically renew unless cancelled 48 hours prior."
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "aiResponse" in data
    assert "citedClauses" in data

def test_risk_engine_localizes_output_for_marathi():
    clauses = [
        {
            "id": "c-1",
            "sectionHeading": "Dispute Resolution",
            "text": "You agree to mandatory binding arbitration and waive class action lawsuits.",
            "orderIndex": 1
        }
    ]
    res = RiskEngine.evaluate(clauses, language="Marathi")
    assert "धोका" in res["summary"] or "तपास" in res["summary"]


def test_chat_api_localizes_response_for_hindi():
    payload = {
        "documentId": "test-doc",
        "query": "यह वेबसाइट सुरक्षित है?",
        "contextText": "यह सेवा आपकी जानकारी साझा कर सकती है।",
        "language": "Hindi"
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "खतरा" in data["aiResponse"] or "सुरक्षा" in data["aiResponse"]


def test_history_api_endpoint():
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert "history" in data

def test_report_download_endpoint():
    response = client.get("/api/v1/report/demo-1")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

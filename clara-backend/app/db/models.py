from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True) # UUID or hash
    title = Column(String(512), nullable=False)
    url = Column(Text, nullable=True)
    doc_type = Column(String(100), default="Terms & Conditions") # Privacy Policy, EULA, SaaS, Contract
    raw_text = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")
    reports = relationship("RiskReport", back_populates="document", cascade="all, delete-orphan")
    chats = relationship("AIChat", back_populates="document", cascade="all, delete-orphan")

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id"), nullable=False)
    section_heading = Column(String(255), nullable=True)
    text = Column(Text, nullable=False)
    category = Column(String(100), default="General") # Privacy, Liability, Termination, IP, Payment
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=0.0)
    is_hidden = Column(Boolean, default=False)
    explanation = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    document = relationship("Document", back_populates="clauses")

class RiskReport(Base):
    __tablename__ = "risk_reports"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id"), nullable=False)
    summary = Column(Text, nullable=False)
    overall_risk = Column(Integer, nullable=False) # 0-100
    recommendation = Column(String(100), nullable=False) # Accept, Reject, Proceed Carefully
    trust_score = Column(Integer, nullable=False)
    transparency_score = Column(Integer, nullable=False)
    privacy_score = Column(Integer, nullable=False)
    financial_risk = Column(Integer, nullable=False)
    compliance_risk = Column(Integer, nullable=False)
    confidence = Column(Integer, default=95)
    pros = Column(JSON, default=list)
    cons = Column(JSON, default=list)
    graph_data = Column(JSON, default=dict)
    hidden_clauses = Column(JSON, default=list)
    risk_categories = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="reports")

class AIChat(Base):
    __tablename__ = "ai_chats"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id"), nullable=False)
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    cited_clauses = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chats")

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    document_type = Column(String(100), nullable=True)
    risk_level_flagged = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(255), nullable=False)
    jurisdiction = Column(String(100), default="Global") # GDPR, CCPA, DPDP Act 2023, EU AI Act
    description = Column(Text, nullable=False)
    keywords = Column(JSON, default=list)

class EmbeddingStore(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    clause_id = Column(String(64), index=True)
    vector = Column(JSON, nullable=False)

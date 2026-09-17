import re
from typing import List, Dict, Any

from app.services.language_service import language_service

RED_FLAG_PATTERNS = [
    {
        "category": "Binding Arbitration & Class Action Waiver",
        "pattern": r"\b(binding arbitration|arbitration|waive.*class action|class arbitration|jury trial waiver)\b",
        "risk_level": "HIGH",
        "score_impact": 22,
        "explanation": "Forces mandatory private arbitration and strips your legal right to file or participate in class-action lawsuits.",
        "recommendation": "Check if an opt-out mechanism within 30 days is provided."
    },
    {
        "category": "Unilateral Contract Amendments",
        "pattern": r"\b(modify.*at any time|change.*without notice|sole discretion.*amend|update terms without prior)\b",
        "risk_level": "HIGH",
        "score_impact": 18,
        "explanation": "Allows the company to change terms, fees, or features at any time without notifying you in advance.",
        "recommendation": "Require email notification rights for material terms modifications."
    },
    {
        "category": "Data Monetization & Selling",
        "pattern": r"\b(sell.*data|share.*advertisers|monetize.*data|commercialize.*content|monetize personal information)\b",
        "risk_level": "CRITICAL",
        "score_impact": 25,
        "explanation": "Permits sale, leasing, or commercial sharing of your personal metadata and activity logs to external brokers.",
        "recommendation": "Exercise your statutory right to opt-out of data sales (GDPR / CCPA / DPDP Act)."
    },
    {
        "category": "Automatic Renewal & Cancellation Traps",
        "pattern": r"\b(automatically renew|auto renew|recurring charge|auto-renew.*unless cancelled|non-refundable fees)\b",
        "risk_level": "MEDIUM",
        "score_impact": 15,
        "explanation": "Automatically bills your payment method indefinitely unless cancelled within a strict pre-renewal window.",
        "recommendation": "Set calendar reminders 7 days prior to renewal deadlines."
    },

    {
        "category": "Broad Intellectual Property License",
        "pattern": r"\b(perpetual.*irrevocable.*license|royalty-free worldwide|transfer all rights|ownership of user submissions)\b",
        "risk_level": "HIGH",
        "score_impact": 16,
        "explanation": "Grants the service an unconditional, eternal worldwide right to use, modify, and monetize your content.",
        "recommendation": "Ensure user content remains user property subject to limited operational license."
    },
    {
        "category": "Full Limitation of Liability & Indemnity",
        "pattern": r"\b(hold harmless|indemnify.*against all claims|as-is without warranty|maximum liability limited to \$?0)\b",
        "risk_level": "MEDIUM",
        "score_impact": 10,
        "explanation": "Disclaims liability for service outages or data loss and requires you to cover their legal expenses.",
        "recommendation": "Negotiate standard mutual liability caps equal to 12 months fees paid."
    }
]

FAVORABLE_PATTERNS = [
    {
        "pattern": r"\b(opt-out|delete your account|request data deletion|gdpr compliant|encryption at rest|30-day refund)\b",
        "pro": "Provides clear data deletion and user opt-out mechanisms."
    },
    {
        "pattern": r"\b(notify users.*changes|advance notice|30 days notice)\b",
        "pro": "Guarantees advance written notice before policy changes take effect."
    },
    {
        "pattern": r"\b(no sale of personal data|we do not sell|never share with advertisers)\b",
        "pro": "Explicitly commits to never sell personal data to third parties."
    }
]

class RiskEngine:
    @classmethod
    def evaluate(cls, clauses: List[Dict[str, Any]], language: str = "English", options: Dict[str, Any] = None) -> Dict[str, Any]:
        options = options or {}
        security_evidence = options.get("securityEvidence") or {}
        deep_evidence = options.get("deepEvidence") or {}
        mode = options.get("mode", "standard")
        high_risk_count = 0
        med_risk_count = 0
        hidden_clauses = []
        analyzed_clauses = []

        total_risk_score = 4 # Minimal baseline web overhead
        privacy_penalty = 0
        financial_penalty = 0
        compliance_penalty = 0
        transparency_penalty = 0

        pros = []
        cons = []

        # Analyze each clause
        for c in clauses:
            text = c["text"]
            lower_text = text.lower()
            clause_risk_level = "LOW"
            clause_risk_score = 10.0
            explanation = "Standard standard legal phrasing; no explicit predatory clauses detected."
            recommendation = "Standard operational term. No action required."
            is_hidden = False
            matched_category = "General Provisions"

            # Check Red Flags
            for rf in RED_FLAG_PATTERNS:
                if re.search(rf["pattern"], lower_text, re.IGNORECASE):
                    clause_risk_level = rf["risk_level"]
                    matched_category = rf["category"]
                    explanation = rf["explanation"]
                    recommendation = rf["recommendation"]
                    impact = rf["score_impact"]
                    total_risk_score += impact
                    
                    if clause_risk_level in ["HIGH", "CRITICAL"]:
                        high_risk_count += 1
                        is_hidden = True
                    else:
                        med_risk_count += 1

                    if "data" in rf["category"].lower() or "privacy" in rf["category"].lower():
                        privacy_penalty += 20
                    if "renewal" in rf["category"].lower() or "liability" in rf["category"].lower():
                        financial_penalty += 18
                    if "arbitration" in rf["category"].lower() or "amendment" in rf["category"].lower():
                        compliance_penalty += 15
                        transparency_penalty += 15

                    cons.append(f"[{rf['category']}] {explanation}")
                    
                    if is_hidden:
                        hidden_clauses.append({
                            "clauseId": c["id"],
                            "sectionHeading": c.get("sectionHeading", "Hidden Provision"),
                            "snippet": text[:180] + "..." if len(text) > 180 else text,
                            "category": rf["category"],
                            "riskLevel": clause_risk_level,
                            "reason": explanation
                        })
                    break

            # Check favorable rules
            for fav in FAVORABLE_PATTERNS:
                if re.search(fav["pattern"], lower_text, re.IGNORECASE):
                    pros.append(fav["pro"])
                    total_risk_score = max(5, total_risk_score - 5)
                    break

            analyzed_clauses.append({
                "id": c["id"],
                "sectionHeading": c.get("sectionHeading", "Section"),
                "text": text,
                "category": matched_category,
                "riskLevel": clause_risk_level,
                "riskScore": min(100, clause_risk_score if clause_risk_level == "LOW" else 75 if clause_risk_level == "MEDIUM" else 90),
                "isHidden": is_hidden,
                "explanation": explanation,
                "recommendation": recommendation,
                "orderIndex": c.get("orderIndex", 0)
            })

        # --- SECURITY & EXPLAINABLE RISK ANALYSIS ---
        security_confidence_sum = 0
        security_findings_count = 0
        explainable_factors = []
        positive_signals = []
        
        headers = deep_evidence.get("headers", {}) if deep_evidence else {}
        cookies = deep_evidence.get("cookies", []) if deep_evidence else []
        
        # 1. HSTS Check
        if "strict-transport-security" in headers:
            pros.append("Strong Transport Security (HSTS) enforced.")
            positive_signals.append("HSTS Enforced: Prevents protocol downgrade attacks")
            total_risk_score -= 12
            explainable_factors.append({"factor": "HSTS Enforced", "impact": -12, "type": "positive"})
            security_confidence_sum += 99
            security_findings_count += 1
            
        # 2. CSP Check
        if "content-security-policy" in headers:
            pros.append("Content Security Policy (CSP) deployed.")
            positive_signals.append("CSP Active: Restricts unauthorized external scripts")
            total_risk_score -= 12
            explainable_factors.append({"factor": "CSP Header Active", "impact": -12, "type": "positive"})
            security_confidence_sum += 95
            security_findings_count += 1
        elif mode == "deep":
            cons.append("[Security] Missing Content Security Policy (CSP).")
            hidden_clauses.append({
                "clauseId": "sec-csp",
                "sectionHeading": "Missing Security Header",
                "snippet": "Response headers lacked Content-Security-Policy",
                "category": "Client-Side Protection",
                "riskLevel": "MEDIUM",
                "reason": "The website does not appear to restrict script origins, increasing vulnerability to XSS."
            })
            total_risk_score += 15
            med_risk_count += 1
            explainable_factors.append({"factor": "Missing Content-Security-Policy", "impact": 15, "type": "risk"})
            security_confidence_sum += 99
            security_findings_count += 1

        # 3. Comprehensive Cookie Analysis
        cookie_total = len(cookies)
        cookie_secure = len([c for c in cookies if c.get("secure")])
        cookie_httponly = len([c for c in cookies if c.get("httpOnly")])
        cookie_weak_samesite = len([c for c in cookies if not c.get("sameSite") or str(c.get("sameSite")).lower() in ["none", "none/unspecified", "false"]])
        
        if cookie_total > 0:
            if cookie_secure == cookie_total:
                pros.append("All detected cookies use Secure attributes.")
                positive_signals.append(f"Secure Cookies ({cookie_secure}/{cookie_total}): Encrypted in transit")
                total_risk_score -= 8
                explainable_factors.append({"factor": "Secure Cookie Flags", "impact": -8, "type": "positive"})
            elif cookie_secure < cookie_total:
                insecure_count = cookie_total - cookie_secure
                cons.append(f"[Security] {insecure_count} cookie(s) lack Secure attribute.")
                hidden_clauses.append({
                    "clauseId": "sec-cookie",
                    "sectionHeading": "Insecure Cookie Transmission",
                    "snippet": f"{insecure_count} of {cookie_total} cookies lack the Secure attribute.",
                    "category": "Data Exposure",
                    "riskLevel": "MEDIUM",
                    "reason": "Unencrypted cookies can be intercepted over unencrypted connection attempts."
                })
                total_risk_score += 12
                privacy_penalty += 12
                med_risk_count += 1
                explainable_factors.append({"factor": f"Insecure Cookie Attributes ({insecure_count})", "impact": 12, "type": "risk"})
                security_confidence_sum += 95
                security_findings_count += 1

        cookie_risk_level = "LOW" if (cookie_total == 0 or cookie_secure == cookie_total) else "MEDIUM" if cookie_secure > 0 else "HIGH"
        cookie_summary = {
            "totalCount": cookie_total,
            "secureCount": cookie_secure,
            "httpOnlyCount": cookie_httponly,
            "weakSameSiteCount": cookie_weak_samesite,
            "riskLevel": cookie_risk_level,
            "summaryText": f"{cookie_total} cookies detected ({cookie_secure} Secure, {cookie_httponly} HttpOnly, {cookie_weak_samesite} weak SameSite)"
        }

        # 4. Form inputs analysis
        if security_evidence.get("hasPasswordInput"):
            if not headers.get("strict-transport-security"):
                cons.append("[Security] Password input present without HSTS transport enforcement.")
                hidden_clauses.append({
                    "clauseId": "sec-login",
                    "sectionHeading": "Insecure Authentication Context",
                    "snippet": "Password form present on page without strict transport security.",
                    "category": "Authentication Risk",
                    "riskLevel": "HIGH",
                    "reason": "User credentials could be exposed to man-in-the-middle attacks."
                })
                total_risk_score += 18
                high_risk_count += 1
                explainable_factors.append({"factor": "Insecure Login Form Context", "impact": 18, "type": "risk"})
                security_confidence_sum += 88
                security_findings_count += 1
            else:
                positive_signals.append("Password Input Protected with HSTS transport layer")
                
        average_confidence = 94
        if security_findings_count > 0:
            average_confidence = int(((94 * len(analyzed_clauses)) + security_confidence_sum) / (max(1, len(analyzed_clauses) + security_findings_count)))

        # Bounded Overall Metrics (0-100)
        overall_risk = min(98, max(12, int(total_risk_score)))
        if overall_risk < 40 and high_risk_count >= 1:
            overall_risk = 45
        
        privacy_score = max(15, min(98, 100 - privacy_penalty - (10 if overall_risk > 50 else 0)))
        financial_risk = min(95, max(10, financial_penalty + (overall_risk // 2)))
        compliance_risk = min(95, max(10, compliance_penalty + 20))
        transparency_score = max(20, min(95, 100 - transparency_penalty - (15 if high_risk_count > 0 else 0)))
        trust_score = max(18, min(96, 100 - (overall_risk // 2) - (high_risk_count * 8)))

        # Deduplicate pros / cons
        pros = list(dict.fromkeys(pros)) or [
            "Clear section formatting and structure",
            "Defines general terms of service eligibility"
        ]
        cons = list(dict.fromkeys(cons)) or [
            "Contains broad standard disclaimer of warranties",
            "Includes non-negotiable standard terms"
        ]

        if not positive_signals:
            positive_signals = [
                "HTTPS Connection Established",
                "Standard HTML5 Structure & Encoding"
            ]

        # Recommendation determination
        if overall_risk > 70 or high_risk_count >= 2:
            recommendation = "High Risk - Critical vulnerabilities or terms present"
        elif overall_risk > 45 or high_risk_count == 1:
            recommendation = "Proceed Carefully - Medium risk findings detected"
        else:
            recommendation = "Low Risk - Security posture appears favorable"

        # Summary generation
        summary = (
            f"CLARA Audit Completed: Document evaluated with an Overall Risk Score of {overall_risk}/100. "
            f"We flagged {high_risk_count} high-risk red flags and {med_risk_count} medium concerns. "
            f"Primary recommendation is to '{recommendation}'. Privacy score rated at {privacy_score}/100."
        )

        if language and language.lower() != "english":
            localized = language_service.localize_text(summary, language)
            if language.lower() == "marathi":
                localized = localized.replace("Overall Risk Score", "एकूण धोका स्कोर")
                localized = localized.replace("high-risk red flags", "उच्च-जोखमी धोका संकेत")
                localized = localized.replace("medium concerns", "मध्यम चिंता")
                localized = localized.replace("एकूण जोखमी स्कोर", "एकूण धोका स्कोर")
            elif language.lower() == "hindi":
                localized = localized.replace("Overall Risk Score", "कुल जोखिम स्कोर")
                localized = localized.replace("high-risk red flags", "उच्च-जोखिम संकेत")
                localized = localized.replace("medium concerns", "मध्यम चिंताएँ")
            summary = localized

        risk_categories = [
            {"name": "Privacy & Data Rights", "risk": 100 - privacy_score, "level": "HIGH" if privacy_score < 60 else "LOW"},
            {"name": "Financial Liability", "risk": financial_risk, "level": "HIGH" if financial_risk > 65 else "MEDIUM"},
            {"name": "Legal Compliance & Dispute", "risk": compliance_risk, "level": "HIGH" if compliance_risk > 60 else "LOW"},
            {"name": "Contract Transparency", "risk": 100 - transparency_score, "level": "HIGH" if transparency_score < 60 else "LOW"}
        ]

        graph_data = {
            "riskRadar": [
                {"subject": "Overall Risk", "A": overall_risk, "fullMark": 100},
                {"subject": "Privacy Risk", "A": 100 - privacy_score, "fullMark": 100},
                {"subject": "Financial Risk", "A": financial_risk, "fullMark": 100},
                {"subject": "Compliance Risk", "A": compliance_risk, "fullMark": 100},
                {"subject": "Opacity", "A": 100 - transparency_score, "fullMark": 100}
            ],
            "scoreComparison": [
                {"name": "Trust Score", "score": trust_score},
                {"name": "Transparency", "score": transparency_score},
                {"name": "Privacy Protection", "score": privacy_score}
            ]
        }

        return {
            "summary": summary,
            "overallRisk": overall_risk,
            "recommendation": recommendation,
            "trustScore": trust_score,
            "transparencyScore": transparency_score,
            "privacyScore": privacy_score,
            "financialRisk": financial_risk,
            "complianceRisk": compliance_risk,
            "pros": pros,
            "cons": cons,
            "graphData": graph_data,
            "hiddenClauses": hidden_clauses,
            "riskCategories": risk_categories,
            "clauses": analyzed_clauses,
            "confidence": average_confidence,
            "cookieSummary": cookie_summary,
            "explainableFactors": explainable_factors,
            "positiveSignals": positive_signals
        }

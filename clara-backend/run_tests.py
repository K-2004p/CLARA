import unittest
from app.services.segmenter import ClauseSegmenter
from app.services.risk_engine import RiskEngine

class TestCLARABackend(unittest.TestCase):
    def test_clause_segmenter(self):
        sample = "Section 1. Arbitration.\nYou agree to arbitration.\nSection 2. Renewal.\nAuto renews monthly."
        clauses = ClauseSegmenter.segment(sample)
        self.assertGreaterEqual(len(clauses), 2)
        print("[OK] Clause Segmenter Test Passed.")

    def test_risk_engine(self):
        clauses = [
            {
                "id": "c-1",
                "sectionHeading": "Dispute Resolution",
                "text": "You agree to mandatory binding arbitration and waive class action lawsuits.",
                "orderIndex": 1
            },
            {
                "id": "c-2",
                "sectionHeading": "Data Monetization",
                "text": "We reserve rights to sell personal user data to third party advertisers.",
                "orderIndex": 2
            }
        ]
        result = RiskEngine.evaluate(clauses)
        self.assertIn("overallRisk", result)
        self.assertIn("recommendation", result)
        self.assertIn("trustScore", result)
        self.assertIn("privacyScore", result)
        self.assertIn("financialRisk", result)
        self.assertIn("complianceRisk", result)
        self.assertIn("hiddenClauses", result)
        self.assertGreater(result["overallRisk"], 50)
        self.assertGreater(len(result["hiddenClauses"]), 0)
        print("[OK] Legal Risk Engine Calculation Test Passed.")

if __name__ == '__main__':
    unittest.main()

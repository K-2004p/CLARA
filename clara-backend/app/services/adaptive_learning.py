from typing import Dict, Any, List


class AdaptiveLearningService:
    """Lightweight, safe feedback memory for CLARA.

    This does not retrain the model automatically. It stores validated user feedback
    and preferences that can influence future response style without using untrusted
    webpage content as training data.
    """

    def __init__(self):
        self._feedback_history: List[Dict[str, Any]] = []
        self._language_preferences: Dict[str, int] = {}
        self._explanation_preferences: Dict[str, int] = {}
        self._accepted_corrections: List[Dict[str, Any]] = []
        self._rejected_suggestions: List[Dict[str, Any]] = []

    def record_feedback(self, feedback: Dict[str, Any]) -> Dict[str, Any]:
        normalized = {
            "feedbackType": feedback.get("feedbackType", "helpful"),
            "value": feedback.get("value", "helpful"),
            "language": feedback.get("language", "English"),
            "context": feedback.get("context", "chat"),
            "timestamp": feedback.get("timestamp"),
            "messageId": feedback.get("messageId"),
            "findingId": feedback.get("findingId")
        }
        self._feedback_history.append(normalized)

        if normalized["language"]:
            self._language_preferences[normalized["language"]] = self._language_preferences.get(normalized["language"], 0) + 1

        if normalized["feedbackType"] == "explanation_style":
            style = normalized["value"]
            self._explanation_preferences[style] = self._explanation_preferences.get(style, 0) + 1
        elif normalized["value"] in {"correct", "helpful"}:
            self._accepted_corrections.append(normalized)
        elif normalized["value"] in {"incorrect", "not_helpful"}:
            self._rejected_suggestions.append(normalized)

        return self.build_profile()

    def build_profile(self) -> Dict[str, Any]:
        preferred_language = max(self._language_preferences.items(), key=lambda item: item[1], default=("English", 0))[0]
        preferred_style = max(self._explanation_preferences.items(), key=lambda item: item[1], default=("balanced", 0))[0]
        return {
            "languagePreference": preferred_language,
            "explanationPreference": preferred_style,
            "feedbackHistory": self._feedback_history[-10:],
            "acceptedCorrections": self._accepted_corrections[-10:],
            "rejectedSuggestions": self._rejected_suggestions[-10:]
        }


adaptive_learning_service = AdaptiveLearningService()

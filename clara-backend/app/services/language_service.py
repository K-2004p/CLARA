import re
from typing import Dict, List, Tuple

SUPPORTED_LANGUAGES = {
    'English': 'en',
    'Hindi': 'hi',
    'Marathi': 'mr',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Bengali': 'bn',
    'Gujarati': 'gu',
    'Kannada': 'kn',
    'Malayalam': 'ml',
    'Punjabi': 'pa',
    'Urdu': 'ur'
}

LANGUAGE_HINTS = {
    'en': {'label': 'English', 'fallback': 'English'},
    'hi': {'label': 'Hindi', 'fallback': 'Hindi'},
    'mr': {'label': 'Marathi', 'fallback': 'Marathi'},
    'ta': {'label': 'Tamil', 'fallback': 'Tamil'},
    'te': {'label': 'Telugu', 'fallback': 'Telugu'},
    'bn': {'label': 'Bengali', 'fallback': 'Bengali'},
    'gu': {'label': 'Gujarati', 'fallback': 'Gujarati'},
    'kn': {'label': 'Kannada', 'fallback': 'Kannada'},
    'ml': {'label': 'Malayalam', 'fallback': 'Malayalam'},
    'pa': {'label': 'Punjabi', 'fallback': 'Punjabi'},
    'ur': {'label': 'Urdu', 'fallback': 'Urdu'}
}

class LanguageService:
    @staticmethod
    def normalize_language(language: str | None) -> str:
        if not language:
            return 'English'
        if language in SUPPORTED_LANGUAGES:
            return language
        code = language.lower()
        for name, lang_code in SUPPORTED_LANGUAGES.items():
            if code.startswith(lang_code) or code.startswith(name.lower()):
                return name
        return 'English'

    @staticmethod
    def detect_language(text: str | None, fallback: str = 'English') -> Dict[str, object]:
        if not text:
            return {'language': fallback, 'confidence': 0.1, 'isReliable': False, 'secondaryLanguages': []}

        sample = re.sub(r'\s+', ' ', text[:4000]).strip()
        if not sample:
            return {'language': fallback, 'confidence': 0.1, 'isReliable': False, 'secondaryLanguages': []}

        hints = []
        if re.search(r'[\u0900-\u097F]', sample):
            hints.append(('Hindi', 0.9))
        if re.search(r'[\u0905-\u0939]', sample):
            hints.append(('Hindi', 0.85))
        if re.search(r'[\u092E-\u0948]', sample):
            hints.append(('Marathi', 0.85))
        if re.search(r'[\u0B80-\u0BFF]', sample):
            hints.append(('Tamil', 0.9))
        if re.search(r'[\u0C00-\u0C7F]', sample):
            hints.append(('Telugu', 0.9))
        if re.search(r'[\u0A80-\u0AFF]', sample):
            hints.append(('Gujarati', 0.9))
        if re.search(r'[\u0C80-\u0CFF]', sample):
            hints.append(('Kannada', 0.9))
        if re.search(r'[\u0980-\u09FF]', sample):
            hints.append(('Bengali', 0.9))
        if re.search(r'[\u0A00-\u0A7F]', sample):
            hints.append(('Punjabi', 0.9))
        if re.search(r'[\u0600-\u06FF]', sample):
            hints.append(('Urdu', 0.9))

        if hints:
            primary = hints[0][0]
            confidence = hints[0][1]
            secondary = [name for name, _ in hints[1:3]]
            return {'language': primary, 'confidence': confidence, 'isReliable': confidence >= 0.8, 'secondaryLanguages': secondary}

        return {'language': fallback, 'confidence': 0.15, 'isReliable': False, 'secondaryLanguages': []}

    @staticmethod
    def build_language_profile(text: str | None, fallback: str = 'English') -> Dict[str, object]:
        detection = LanguageService.detect_language(text, fallback)
        return {
            'primary': detection['language'],
            'confidence': detection['confidence'],
            'isReliable': detection['isReliable'],
            'secondaryLanguages': detection.get('secondaryLanguages', []),
            'supported': [name for name in ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu'] if name != fallback]
        }

    @staticmethod
    def localize_text(text: str, language: str | None) -> str:
        normalized = LanguageService.normalize_language(language)
        if normalized == 'English':
            return text
        translations = {
            'Hindi': {
                'CLARA Audit Completed': 'CLARA ऑडिट पूरा हुआ',
                'high-risk red flags': 'उच्च-जोखिम वाले रेड फ्लैग',
                'medium concerns': 'मध्यम चिंता',
                'Primary recommendation': 'प्राथमिक अनुशंसा',
                'Privacy score rated': 'गोपनीयता स्कोर',
                'Proceed Carefully': 'सावधानी से आगे बढ़ें',
                'Reject or Request Revisions': 'अस्वीकार करें या संशोधन का अनुरोध करें',
                'Safe to Accept': 'स्वीकार करने के लिए सुरक्षित',
                'Overall Risk Score': 'कुल जोखिम स्कोर',
                'risk': 'जोखिम',
                'recommendation': 'अनुशंसा'
            },
            'Marathi': {
                'CLARA Audit Completed': 'CLARA ऑडिट पूर्ण झाले',
                'high-risk red flags': 'उच्च-जोखमी रेड फ्लॅग',
                'medium concerns': 'मध्यम चिंता',
                'Primary recommendation': 'प्राथमिक शिफारस',
                'Privacy score rated': 'गोपनीयता स्कोर',
                'Proceed Carefully': 'सावधीत पुढे जा',
                'Reject or Request Revisions': 'नाकारा किंवा सुधारणा विनंती करा',
                'Safe to Accept': 'स्वीकार करण्यासाठी सुरक्षित',
                'Overall Risk Score': 'एकूण जोखमी स्कोर',
                'risk': 'जोखम',
                'recommendation': 'शिफारस'
            }
        }
        if normalized in translations:
            template = text
            for source, target in translations[normalized].items():
                template = template.replace(source, target)
            return template
        return text

language_service = LanguageService()

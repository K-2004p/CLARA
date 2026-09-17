import React from 'react';
import { useStore } from '../store/useStore';
import { Globe, Sparkles } from 'lucide-react';

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil',
  'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Punjabi', 'Urdu'
];

export const WelcomeScreen: React.FC = () => {
  const { setLanguage, setHasCompletedOnboarding } = useStore();

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    setHasCompletedOnboarding(true);
    // Optionally save to Chrome storage if available
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ claraLanguage: lang, claraOnboarded: true });
    }
  };

  const handleAutoDetect = () => {
    // Basic auto detect based on browser navigator
    const langCode = navigator.language || 'en';
    let detected = 'English';
    if (langCode.startsWith('hi')) detected = 'Hindi';
    else if (langCode.startsWith('mr')) detected = 'Marathi';
    else if (langCode.startsWith('gu')) detected = 'Gujarati';
    else if (langCode.startsWith('ta')) detected = 'Tamil';
    else if (langCode.startsWith('te')) detected = 'Telugu';
    else if (langCode.startsWith('kn')) detected = 'Kannada';
    else if (langCode.startsWith('ml')) detected = 'Malayalam';
    else if (langCode.startsWith('bn')) detected = 'Bengali';
    else if (langCode.startsWith('pa')) detected = 'Punjabi';
    else if (langCode.startsWith('ur')) detected = 'Urdu';

    handleSelectLanguage(detected);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
        <Sparkles className="w-8 h-8" />
      </div>
      
      <h1 className="text-2xl font-extrabold text-white mb-2">Welcome to CLARA</h1>
      <p className="text-sm text-slate-400 mb-8 max-w-sm">
        Your ambient AI Legal Risk Assessment Engine. To get started, please choose your preferred language for explanations and summaries.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleAutoDetect}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
        >
          <Globe className="w-4 h-4" />
          Auto Detect Browser Language
        </button>
        
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-500">OR SELECT</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelectLanguage(lang)}
              className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold transition-all"
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

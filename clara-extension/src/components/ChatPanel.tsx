import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { sendChatMessage } from '../utils/api';
import { Send, Bot, User, FileText, Loader2, Mic, Square } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

export const ChatPanel: React.FC = () => {
  const { chatMessages, addChatMessage, analysis, language, pageTitle, pageUrl, activeContextKey } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        // Map common languages to locale codes for STT
        const langMap: Record<string, string> = {
          'English': 'en-US',
          'Hindi': 'hi-IN',
          'Marathi': 'mr-IN',
          'Gujarati': 'gu-IN',
          'Tamil': 'ta-IN',
          'Telugu': 'te-IN',
          'Kannada': 'kn-IN',
          'Malayalam': 'ml-IN',
          'Bengali': 'bn-IN',
          'Punjabi': 'pa-IN',
          'Urdu': 'ur-IN'
        };
        recognitionRef.current.lang = langMap[language] || 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInput((prev) => prev + transcript + ' ');
            } else {
              interimTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech Recognition is not supported in this browser.");
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');

    addChatMessage({
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setLoading(true);
    const contextText = [
      pageTitle || 'Current page',
      pageUrl || 'Current page',
      analysis?.summary ? `Summary: ${analysis.summary}` : '',
      analysis?.overallRisk !== undefined ? `Security Score/Risk: ${analysis.overallRisk}/100` : '',
      analysis?.riskCategories ? `Categories: ${analysis.riskCategories.map(c => `${c.name} (${c.level})`).join(', ')}` : '',
      analysis?.hiddenClauses ? `Key Findings: ${analysis.hiddenClauses.map(c => c.category + ': ' + c.reason).join(' | ')}` : '',
      analysis?.recommendation ? `Recommendation: ${analysis.recommendation}` : '',
    ].filter(Boolean).join('\n\n');

    const res = await sendChatMessage(analysis?.documentId, userMsg, contextText, language);
    setLoading(false);

    addChatMessage({
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: res.aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citedClauses: res.citedClauses
    });
  };

  return (
    <div className="flex flex-col h-[480px] bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-slate-200">CLARA RAG Assistant</h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
          Gemini RAG Active
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/60 group relative'
              }`}
            >
              <p>{msg.text}</p>
              {msg.sender === 'ai' && (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(msg.text);
                      
                      const langMap: Record<string, string> = {
                        'English': 'en-US', 'Hindi': 'hi-IN', 'Marathi': 'mr-IN',
                        'Gujarati': 'gu-IN', 'Tamil': 'ta-IN', 'Telugu': 'te-IN',
                        'Kannada': 'kn-IN', 'Malayalam': 'ml-IN', 'Bengali': 'bn-IN',
                        'Punjabi': 'pa-IN', 'Urdu': 'ur-IN'
                      };
                      utterance.lang = langMap[language] || 'en-US';
                      
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="absolute -right-6 bottom-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-400 transition-opacity"
                  title="Listen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                </button>
              )}
              {msg.citedClauses && msg.citedClauses.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center gap-1 text-[10px] text-blue-300">
                  <FileText className="w-3 h-3" />
                  <span>Cited: {msg.citedClauses.join(', ')}</span>
                </div>
              )}
              <span className="block text-[9px] text-slate-400 text-right mt-1 opacity-70">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Analyzing contract context with RAG...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
        {isRecording && (
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[10px] text-rose-400 font-bold animate-pulse">Listening...</span>
            <AudioWaveform isRecording={isRecording} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl transition-colors ${
              isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title={isRecording ? "Stop Recording" : "Start Voice Input"}
          >
            {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Ask a question about this contract..."}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

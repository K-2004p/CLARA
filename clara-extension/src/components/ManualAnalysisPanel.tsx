import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { uploadDocument, analyzeDocument } from '../utils/api';
import { Upload, Link as LinkIcon, FileText, Loader2, Image as ImageIcon } from 'lucide-react';

export const ManualAnalysisPanel: React.FC = () => {
  const { setAnalysis, setLoading, setError, language, setPageInfo } = useStore();
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setUploading(true);
    await setLoading(true);
    await setError(null);
    try {
      // In a real app, the backend would fetch this URL, but here we simulate or send to analyze endpoint
      const result = await analyzeDocument('', 'Manual URL Analysis', url, language, { mode: 'manual_url' });
      await setPageInfo('Manual URL Analysis', url);
      await setAnalysis(result);
    } catch (err: any) {
      await setError(err?.message || 'URL Analysis failed.');
    } finally {
      setUploading(false);
      await setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await setLoading(true);
    await setError(null);
    try {
      const result = await uploadDocument(file);
      await setPageInfo(file.name, `file://${file.name}`);
      await setAnalysis(result);
    } catch (err: any) {
      await setError(err?.message || 'File Upload failed.');
    } finally {
      setUploading(false);
      await setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-400" />
          Analyze via URL
        </h3>
        <p className="text-xs text-slate-400">
          Paste a link to any privacy policy or terms of service page to analyze it directly.
        </p>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/terms"
            required
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={uploading || !url.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
          </button>
        </form>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-center">
        <Upload className="w-8 h-8 text-blue-400 mx-auto" />
        <h3 className="text-sm font-extrabold text-white">Upload Document or Image</h3>
        <p className="text-xs text-slate-400">
          Upload PDF contracts, Word documents, or Screenshots (PNG/JPG) of legal agreements for instant analysis.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer w-full max-w-[200px]">
            {uploading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <>
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Upload PDF/Doc</span>
              </>
            )}
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer w-full max-w-[200px]">
            {uploading ? (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Upload Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

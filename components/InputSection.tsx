import React, { useState } from 'react';
import { InputType } from '../types';
import { Search, Link as LinkIcon, Image as ImageIcon, FileText, Loader2, X } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (input: string | File, type: InputType) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<InputType>(InputType.TEXT);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeTab === InputType.TEXT && textInput.trim()) {
      onAnalyze(textInput, InputType.TEXT);
    } else if (activeTab === InputType.URL && urlInput.trim()) {
      onAnalyze(urlInput, InputType.URL);
    } else if (activeTab === InputType.IMAGE && selectedFile) {
      onAnalyze(selectedFile, InputType.IMAGE);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab(InputType.TEXT)}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === InputType.TEXT ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700/50 text-slate-400'
          }`}
        >
          <FileText size={18} />
          <span className="font-medium">Text / Claim</span>
        </button>
        <button
          onClick={() => setActiveTab(InputType.URL)}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === InputType.URL ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700/50 text-slate-400'
          }`}
        >
          <LinkIcon size={18} />
          <span className="font-medium">URL</span>
        </button>
        <button
          onClick={() => setActiveTab(InputType.IMAGE)}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === InputType.IMAGE ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700/50 text-slate-400'
          }`}
        >
          <ImageIcon size={18} />
          <span className="font-medium">Image</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {activeTab === InputType.TEXT && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste a claim, rumor, or social media post text here to check its validity..."
            className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        )}

        {activeTab === InputType.URL && (
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/news-article"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        )}

        {activeTab === InputType.IMAGE && (
          <div className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center bg-slate-900 relative">
            {!selectedFile ? (
              <>
                <ImageIcon className="text-slate-500 mb-2" size={32} />
                <p className="text-slate-400 text-sm">Click to upload or drag & drop</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            ) : (
              <div className="flex items-center gap-3">
                 <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded-md border border-slate-700" 
                 />
                 <div className="flex flex-col">
                    <span className="text-slate-200 text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                    <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                        className="text-red-400 text-xs hover:text-red-300 flex items-center gap-1 mt-1"
                    >
                        <X size={12}/> Remove
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (activeTab === InputType.TEXT && !textInput) || (activeTab === InputType.URL && !urlInput) || (activeTab === InputType.IMAGE && !selectedFile)}
          className={`w-full mt-6 py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
            isLoading
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing Knowledge Graph...
            </>
          ) : (
            <>
              <Search size={20} /> Verify Truthfulness
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;

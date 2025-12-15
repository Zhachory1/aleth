import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import FeedbackSection from './components/FeedbackSection';
import { FactCheckResult, InputType } from './types';
import { analyzeContent } from './services/geminiService';
import { CheckCircle2, AlertOctagon } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Checking for API Key on mount
  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("Critical Error: API Key is not configured in the environment.");
    }
  }, []);

  const handleAnalyze = async (input: string | File, type: InputType) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeContent(input, type);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while verifying.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
             <div className="p-3 bg-blue-600/20 rounded-full border border-blue-500/30">
                <CheckCircle2 size={32} className="text-blue-400" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Aleth <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Autonomous Fact-Checking System powered by Gemini 2.5 & Google Search Grounding.
            Detect satire, fake news, and twisted facts instantly.
          </p>
        </header>

        {/* Main Content */}
        <main>
          <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />

          {/* Error State */}
          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 max-w-3xl mx-auto text-red-200">
               <AlertOctagon className="text-red-500 flex-shrink-0" />
               <p>{error}</p>
            </div>
          )}

          {/* Results State */}
          {result && (
             <>
               <ResultsSection result={result} />
               <FeedbackSection />
             </>
          )}

          {/* Empty State (when no result yet) */}
          {!result && !isLoading && !error && (
            <div className="mt-16 text-center text-slate-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors">
                     <div className="text-2xl mb-2">🕵️</div>
                     <h3 className="text-slate-300 font-semibold mb-2">Deep Analysis</h3>
                     <p className="text-sm">Categorizes misinformation into partial truths, fabricated stories, or satire.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors">
                     <div className="text-2xl mb-2">🌐</div>
                     <h3 className="text-slate-300 font-semibold mb-2">Live Grounding</h3>
                     <p className="text-sm">Connects to real-time Google Search to verify claims against the latest news.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors">
                     <div className="text-2xl mb-2">⚖️</div>
                     <h3 className="text-slate-300 font-semibold mb-2">Source Credibility</h3>
                     <p className="text-sm">Evaluates website reputation and cross-references with major fact-checkers.</p>
                  </div>
               </div>
            </div>
          )}
        </main>
        
        <footer className="mt-20 text-center text-slate-600 text-sm">
           <p>© {new Date().getFullYear()} Aleth AI. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

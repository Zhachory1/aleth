import React from 'react';
import { FactCheckResult, FactCategory, MisleadingSubCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, ExternalLink, Globe, Landmark } from 'lucide-react';

interface ResultsSectionProps {
  result: FactCheckResult;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ result }) => {
  // Gauge Data
  const gaugeData = [
    { name: 'Score', value: result.truthScore },
    { name: 'Remaining', value: 100 - result.truthScore },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(result.truthScore);

  const getCategoryIcon = (category: FactCategory) => {
    switch (category) {
      case FactCategory.VERIFIED:
        return <ShieldCheck className="text-green-500" size={32} />;
      case FactCategory.MISLEADING:
        return <ShieldAlert className="text-red-500" size={32} />;
      case FactCategory.SATIRE:
        return <Info className="text-purple-500" size={32} />;
      default:
        return <AlertTriangle className="text-yellow-500" size={32} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 to-transparent pointer-events-none" />
          <h3 className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-sm">Truth Score</h3>
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#334155" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-4xl font-bold text-white">{result.truthScore}%</span>
            </div>
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: scoreColor }}>
            {result.truthScore >= 80 ? 'Highly Credible' : result.truthScore >= 50 ? 'Questionable' : 'Likely False'}
          </p>
        </div>

        {/* Category Card */}
        <div className="md:col-span-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 to-transparent pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
              {getCategoryIcon(result.category)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{result.category}</h3>
              {result.subCategory && result.subCategory !== MisleadingSubCategory.NONE && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  {result.subCategory}
                </span>
              )}
              <p className="text-slate-300 mt-3 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Source Credibility Bar */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
             <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm flex items-center gap-2"><Globe size={14}/> Source Reputation</span>
                <span className="text-slate-300 text-sm font-semibold">{result.sourceCredibilityScore}/100</span>
             </div>
             <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${result.sourceCredibilityScore}%` }}
                />
             </div>
             <p className="text-xs text-slate-500 mt-1">
                Based on domain authority, historical accuracy, and bias analysis.
             </p>
          </div>
        </div>
      </div>

      {/* Cross-Reference Section (External Fact Checks) */}
      {result.externalFactChecks.length > 0 && (
          <div className="mt-6 bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Landmark size={16} /> Official Cross-References
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {result.externalFactChecks.map((check, idx) => (
                    <a key={idx} href={check.url} target="_blank" rel="noopener noreferrer" className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-center justify-between hover:border-indigo-500 transition-colors">
                        <div>
                           <div className="text-indigo-400 font-bold text-sm">{check.organization}</div>
                           <div className="text-white font-medium">{check.rating}</div>
                        </div>
                        <ExternalLink size={14} className="text-slate-500"/>
                    </a>
                 ))}
              </div>
          </div>
      )}

      {/* Analysis Details */}
      <div className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-blue-400"/> Detailed Analysis
        </h3>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 whitespace-pre-line leading-7">
            {result.detailedAnalysis}
          </p>
        </div>
      </div>

      {/* Grounding Sources */}
      {result.groundingSources.length > 0 && (
        <div className="mt-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Grounding Sources (Web)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.groundingSources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all group"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-slate-200 font-medium text-sm truncate">{source.title}</p>
                  <p className="text-slate-500 text-xs truncate">{new URL(source.uri).hostname}</p>
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;

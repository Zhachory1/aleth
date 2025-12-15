import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send, Check } from 'lucide-react';

const FeedbackSection: React.FC = () => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to a backend DB for RLHF.
    // console.log({ rating, comment, timestamp: Date.now() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center p-3 bg-green-500/20 rounded-full mb-3">
          <Check className="text-green-400" size={24} />
        </div>
        <h3 className="text-white font-semibold text-lg">Thanks for your feedback!</h3>
        <p className="text-green-200/70 text-sm mt-1">Your input has been queued for our review team to improve future model accuracy.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-slate-200 font-semibold mb-2">Do you agree with this analysis?</h3>
      <p className="text-slate-400 text-sm mb-4">Help us improve Aleth by rating this result.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setRating('up')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
              rating === 'up' 
                ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <ThumbsUp size={18} /> Accurate
          </button>
          <button
            type="button"
            onClick={() => setRating('down')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
              rating === 'down' 
                ? 'bg-red-600/20 border-red-500 text-red-400' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <ThumbsDown size={18} /> Inaccurate
          </button>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional: Tell us why the model might be wrong or provide additional context..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none h-24 mb-4"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpandedInfo(!expandedInfo)}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            How is this feedback used?
          </button>
          
          <button
            type="submit"
            disabled={!rating}
            className={`px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-all ${
              !rating ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            <Send size={16} /> Submit Feedback
          </button>
        </div>
      </form>

      {expandedInfo && (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 text-xs text-slate-400 leading-relaxed animate-in slide-in-from-top-2">
          <strong className="text-slate-300 block mb-1">Human-in-the-Loop Learning</strong>
          Your feedback is anonymized and sent to a review queue. Disputed results are manually verified by human fact-checkers. 
          Confirmed corrections are added to our golden dataset, which is used to fine-tune future versions of the model via 
          Reinforcement Learning from Human Feedback (RLHF). This helps the system learn from its mistakes and adapt to new forms of misinformation.
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;

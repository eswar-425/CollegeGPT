import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, onSubmit, initialRating = 'helpful' }) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl relative transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Provide Answer Feedback</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Your feedback directly refines CollegeGPT's document retrieval and grounding accuracy.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRating('helpful')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                rating === 'helpful'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-500/80 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> Helpful
            </button>

            <button
              type="button"
              onClick={() => setRating('not_helpful')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                rating === 'not_helpful'
                  ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-500/80 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsDown className="w-4 h-4" /> Needs Improvement
            </button>
          </div>

          {/* Comment text area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {rating === 'helpful' ? 'What was most helpful?' : 'What was missing or inaccurate?'}
            </label>
            <textarea
              rows={3}
              placeholder={
                rating === 'helpful'
                  ? 'Accurate source reference, clear fee breakdown, etc.'
                  : 'Missing exact page number, outdated semester date, etc.'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

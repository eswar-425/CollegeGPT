import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Clock,
  RotateCw,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const toast = useToast();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getFeedback({
        rating: ratingFilter || undefined,
      });
      setFeedbacks(res.feedback || []);
    } catch (err) {
      toast.error('Failed to load feedback entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [ratingFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ThumbsUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Student Answer Feedback & Quality Oversight
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review thumbs up/down ratings and student comments to fine-tune retrieval thresholds and documents.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm dark:shadow-none"
          title="Refresh"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRatingFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            ratingFilter === ''
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Feedback
        </button>

        <button
          onClick={() => setRatingFilter('helpful')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            ratingFilter === 'helpful'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Helpful
        </button>

        <button
          onClick={() => setRatingFilter('not_helpful')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            ratingFilter === 'not_helpful'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> Needs Improvement
        </button>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading student feedback...</span>
            </div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm shadow-sm dark:shadow-none">
            No feedback entries match the current filter.
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-all space-y-4"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-bold">
                    {fb.userId?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{fb.userId?.name || 'Student'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{fb.userId?.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      fb.rating === 'helpful'
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {fb.rating === 'helpful' ? (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful Answer
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="w-3.5 h-3.5" /> Needs Improvement
                      </>
                    )}
                  </span>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(fb.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Student Comment */}
              {fb.comment && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Student Note:</span>
                  "{fb.comment}"
                </div>
              )}

              {/* AI Message Content Excerpt */}
              {fb.messageId && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Answer Provided by CollegeGPT:</div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {fb.messageId.content}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

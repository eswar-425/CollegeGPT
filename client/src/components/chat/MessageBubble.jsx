import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import SourceCard from './SourceCard';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../../context/AuthContext';

export default function MessageBubble({ message, onFeedbackSubmit }) {
  const { isAdmin } = useAuth();
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackModalSubmit = async ({ rating, comment }) => {
    if (onFeedbackSubmit) {
      await onFeedbackSubmit(message._id || message.id, { rating, comment });
    }
  };

  // Format content with basic markdown support (bold, bullet lists, citations)
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const paragraphs = content.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Check for bullet lines
      const lines = para.split('\n');
      const isBulletList = lines.length > 1 && lines.every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));

      if (isBulletList) {
        return (
          <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-2">
            {lines.map((line, lIdx) => {
              const text = line.replace(/^[-*]\s+/, '');
              return <li key={lIdx}>{formatInline(text)}</li>;
            })}
          </ul>
        );
      }

      // Check for numbered lines
      const isNumberedList = lines.length > 1 && lines.every((l) => /^\d+\.\s+/.test(l.trim()));
      if (isNumberedList) {
        return (
          <ol key={pIdx} className="list-decimal list-inside space-y-1.5 my-2">
            {lines.map((line, lIdx) => {
              const text = line.replace(/^\d+\.\s+/, '');
              return <li key={lIdx}>{formatInline(text)}</li>;
            })}
          </ol>
        );
      }

      return (
        <p key={pIdx} className="mb-3 last:mb-0 leading-relaxed">
          {formatInline(para)}
        </p>
      );
    });
  };

  const formatInline = (text) => {
    // Bold parsing (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const hasSources = message.sources && message.sources.length > 0;
  const currentRating = message.feedback?.rating;

  return (
    <div
      className={`py-5 px-4 sm:px-6 flex gap-4 transition-colors ${
        isAssistant
          ? 'bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/40'
          : 'bg-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Body & Metadata */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAssistant ? 'CollegeGPT AI' : 'You'}
            </span>
            {isAssistant && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <Sparkles className="w-2.5 h-2.5" /> Grounded RAG
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified College Info
                  </>
                )}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
          {renderFormattedContent(message.content)}
        </div>

        {/* Grounded Sources Accordion */}
        {isAssistant && hasSources && (
          <div className="pt-2">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors mb-2.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Official Institutional Sources ({message.sources.length})</span>
              {sourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {sourcesOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fade-in">
                {message.sources.map((src, idx) => (
                  <SourceCard key={idx} source={src} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer info: Feedback and Admin-only diagnostics */}
        {isAssistant && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/40">
            <div className="flex items-center gap-3">
              {/* Only show raw latency & engine provider to Admins */}
              {isAdmin && message.retrievalMetadata?.responseTimeMs && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {message.retrievalMetadata.responseTimeMs}ms
                </span>
              )}
              {isAdmin && message.retrievalMetadata?.provider && (
                <span className="text-[10px] text-slate-500 font-mono">
                  Engine: <span className="text-slate-700 dark:text-slate-300">{message.retrievalMetadata.provider}</span>
                </span>
              )}
            </div>

            {/* Thumbs up / down feedback */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] mr-1">Was this answer accurate?</span>
              <button
                onClick={() => handleRatingClick('helpful')}
                className={`p-1.5 rounded-lg border transition-all ${
                  currentRating === 'helpful'
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-slate-600'
                }`}
                title="Helpful Answer"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleRatingClick('not_helpful')}
                className={`p-1.5 rounded-lg border transition-all ${
                  currentRating === 'not_helpful'
                    ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-700 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-slate-600'
                }`}
                title="Not Helpful / Inaccurate"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedbackModalSubmit}
        initialRating={selectedRating || 'helpful'}
      />
    </div>
  );
}

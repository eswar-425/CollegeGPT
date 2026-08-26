import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark } from 'lucide-react';

export default function SourceCard({ source, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const docName = source.documentName || 'Official Document';
  const page = source.page || 1;
  const category = source.category || 'General';
  const score = source.score ? Math.round(source.score * 100) : null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden hover:border-brand-400 dark:hover:border-brand-500/40 transition-all duration-200 shadow-sm">
      {/* Header / Summary Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{docName}</div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span>Page {page}</span>
              <span>•</span>
              <span className="text-brand-600 dark:text-indigo-300 font-medium">{category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {score !== null && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                score >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                  : score >= 50
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {score}% match
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Snippet Content */}
      {isExpanded && (
        <div className="px-3.5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap animate-fade-in">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 font-sans">
            <Bookmark className="w-3 h-3 text-brand-500 dark:text-brand-400" /> Grounded Passage Excerpt:
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
            {source.snippet || 'Referenced context chunk from document.'}
          </div>
        </div>
      )}
    </div>
  );
}

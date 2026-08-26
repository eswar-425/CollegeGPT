import React from 'react';
import { X, Layers, FileText, Database } from 'lucide-react';

export default function ChunkViewerModal({ isOpen, onClose, document, chunks = [] }) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{document.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{chunks.length} Extracted Chunks</span>
                <span>•</span>
                <span>Category: {document.category}</span>
                <span>•</span>
                <span>Dept: {document.department}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chunks Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chunks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No chunks indexed yet for this document.
            </div>
          ) : (
            chunks.map((chunk, idx) => (
              <div
                key={chunk._id || idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
                      Chunk #{chunk.chunkIndex + 1}
                    </span>
                    <span>Page {chunk.pageNumber || 1}</span>
                    <span>•</span>
                    <span>~{chunk.tokenCount || 0} tokens</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Database className="w-3 h-3 text-slate-400" />
                    ID: {chunk.vectorId || `${document._id}_chunk_${chunk.chunkIndex}`}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {chunk.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

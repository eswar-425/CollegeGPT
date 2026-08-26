import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function RecentDocuments({ documents = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Recent Knowledge Documents
        </h3>
        <Link
          to="/admin/documents"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
        {documents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No documents uploaded yet.</div>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {doc.category} • {doc.chunkCount || 0} chunks
                  </p>
                </div>
              </div>

              <div>
                {doc.status === 'READY' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" /> Processing
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

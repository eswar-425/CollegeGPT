import React, { useState } from 'react';
import {
  FileText,
  RotateCw,
  Trash2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Eye,
} from 'lucide-react';
import ChunkViewerModal from './ChunkViewerModal';
import { documentApi } from '../../services/api';

export default function DocumentTable({
  documents = [],
  onRefresh,
  onDelete,
  onReprocess,
  isLoading = false,
}) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [chunkModalOpen, setChunkModalOpen] = useState(false);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const handleViewChunks = async (doc) => {
    setSelectedDoc(doc);
    setLoadingChunks(true);
    setChunkModalOpen(true);
    try {
      const res = await documentApi.getDocument(doc._id);
      setSelectedChunks(res.chunks || []);
    } catch (err) {
      setSelectedChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 animate-pulse">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th scope="col" className="px-5 py-4">Document</th>
              <th scope="col" className="px-4 py-4">Category & Department</th>
              <th scope="col" className="px-4 py-4">Status</th>
              <th scope="col" className="px-4 py-4">Chunks</th>
              <th scope="col" className="px-4 py-4">Uploaded</th>
              <th scope="col" className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading documents...</span>
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No documents found in knowledge base. Upload one to start!
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  {/* Document Name */}
                  <td className="px-5 py-4 min-w-[220px]">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {doc.originalName} • {doc.fileType?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Department */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{doc.category}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{doc.department}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {getStatusBadge(doc.status)}
                    {doc.errorMessage && (
                      <div className="text-[10px] text-rose-500 dark:text-rose-400 mt-1 max-w-xs truncate" title={doc.errorMessage}>
                        {doc.errorMessage}
                      </div>
                    )}
                  </td>

                  {/* Chunks */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleViewChunks(doc)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-600/20 hover:border-brand-300 dark:hover:border-brand-500/40 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all"
                      title="Inspect extracted chunks"
                    >
                      <Layers className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                      <span>{doc.chunkCount || 0} chunks</span>
                    </button>
                  </td>

                  {/* Upload Date */}
                  <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleViewChunks(doc)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Chunks"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onReprocess(doc._id)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                        title="Reprocess Document"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${doc.name}" and remove all vectors from the knowledge base?`)) {
                            onDelete(doc._id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chunk Inspection Modal */}
      <ChunkViewerModal
        isOpen={chunkModalOpen}
        onClose={() => setChunkModalOpen(false)}
        document={selectedDoc}
        chunks={selectedChunks}
      />
    </div>
  );
}

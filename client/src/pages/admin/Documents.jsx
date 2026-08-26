import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentTable from '../../components/documents/DocumentTable';
import { documentApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Upload,
  Search,
  Filter,
  RotateCw,
  Tag,
  Building2,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Academics',
  'Hostel',
  'Fees',
  'Examinations',
  'Scholarships',
  'Placements',
  'Departments',
  'Library',
  'General',
];

const DEPARTMENTS = [
  'All',
  'General / College-wide',
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Management & MBA',
];

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  const toast = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentApi.getDocuments({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        department: department !== 'All' ? department : undefined,
        status: status !== 'All' ? status : undefined,
      });
      setDocuments(res.documents || []);
    } catch (err) {
      toast.error('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Auto poll if any document is in PROCESSING status
    const interval = setInterval(() => {
      documentApi
        .getDocuments({
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          department: department !== 'All' ? department : undefined,
          status: status !== 'All' ? status : undefined,
        })
        .then((res) => {
          if (res?.documents) setDocuments(res.documents);
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [category, department, status, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleDeleteDocument = async (id) => {
    try {
      await documentApi.deleteDocument(id);
      toast.success('Document and associated vector embeddings deleted.');
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete document.');
    }
  };

  const handleReprocessDocument = async (id) => {
    try {
      await documentApi.reprocessDocument(id);
      toast.success('Document reprocessing queued in background.');
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Failed to reprocess document.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6 overflow-x-hidden transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>Knowledge Base Documents</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Manage institutional documents, inspect extracted semantic chunks, and re-index vector representations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          <button
            onClick={fetchDocuments}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm dark:shadow-none shrink-0"
            title="Refresh list"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/documents/upload"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-sm dark:shadow-lg w-full">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs w-full">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 min-w-0">
            <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-full truncate"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-full truncate"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 min-w-0">
            <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-full truncate"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Statuses</option>
              <option value="READY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Ready</option>
              <option value="PROCESSING" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Processing</option>
              <option value="FAILED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <DocumentTable
        documents={documents}
        onRefresh={fetchDocuments}
        onDelete={handleDeleteDocument}
        onReprocess={handleReprocessDocument}
        isLoading={loading}
      />
    </div>
  );
}

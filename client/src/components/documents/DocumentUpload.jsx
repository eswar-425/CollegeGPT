import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Building2, Tag, Calendar } from 'lucide-react';
import { documentApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'General',
  'Admissions',
  'Academics',
  'Departments',
  'Courses',
  'Fees',
  'Examinations',
  'Academic Calendar',
  'Hostel',
  'Library',
  'Scholarships',
  'Placements',
  'Clubs',
  'Events',
  'Policies',
];

const DEPARTMENTS = [
  'General / College-wide',
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Management & MBA',
];

export default function DocumentUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('General / All Colleges');
  const [category, setCategory] = useState('Academics');
  const [department, setDepartment] = useState('General / College-wide');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    const allowed = ['.pdf', '.docx', '.txt', '.md'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!allowed.includes(ext)) {
      toast.error('Only PDF, DOCX, TXT, and Markdown files are supported.');
      return;
    }

    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a document to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('collegeName', collegeName || 'General / All Colleges');
    formData.append('category', category);
    formData.append('department', department);
    formData.append('academicYear', academicYear);

    try {
      const res = await documentApi.uploadDocument(formData);
      toast.success(`Document "${res.document?.name || name}" uploaded! Ingestion & embedding pipeline started.`);
      setFile(null);
      setName('');
      setCollegeName('General / All Colleges');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      toast.error(err.message || 'Document upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl max-w-3xl mx-auto transition-colors duration-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Knowledge Base Resource</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload institutional PDFs, brochures, or policies. Text will be chunked and indexed into the vector DB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and drop box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 scale-[1.01]'
              : file
              ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/10'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-brand-400 dark:hover:border-brand-500/50 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{file.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                Click to browse or drag & drop document here
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Supported formats: PDF, DOCX, TXT, Markdown (Max 25MB)
              </span>
            </div>
          )}
        </div>

        {/* Metadata Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Document Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Document Display Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Academic Regulations & Grading Handbook 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* College / Institution Scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              College / Institution Scope
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g., General / All Colleges, Oxford Institute, etc."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-2027"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing & Vectorizing Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Upload & Ingest to Knowledge Base</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

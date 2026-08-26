import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DocumentUpload from '../../components/documents/DocumentUpload';
import { ArrowLeft, FileText } from 'lucide-react';

export default function UploadDocument() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin/documents');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/admin/documents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Knowledge Base Documents
        </Link>
      </div>

      {/* Upload Component */}
      <DocumentUpload onUploadSuccess={handleSuccess} />
    </div>
  );
}

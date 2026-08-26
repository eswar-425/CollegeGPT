import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/dashboard/MetricCard';
import RecentDocuments from '../../components/dashboard/RecentDocuments';
import ActivityList from '../../components/dashboard/ActivityList';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Users,
  MessageSquare,
  ThumbsUp,
  Database,
  Upload,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      adminApi.getDashboard().then((res) => {
        if (res?.data) setStats(res.data);
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const metrics = stats?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors duration-200">
      {/* Top Banner & Quick Upload CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Administrator Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Knowledge base oversight, vector database health, and student query analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm dark:shadow-none"
            title="Refresh statistics"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : 'text-brand-600 dark:text-brand-400'}`} />
          </button>

          <Link
            to="/admin/feedback"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm dark:shadow-none"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Feedback ({metrics.feedback?.satisfactionRate || 100}%)
          </Link>

          <Link
            to="/admin/documents/upload"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-600/25 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Key Metrics 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Documents"
          value={loading ? '...' : metrics.totalDocuments || 0}
          subtitle={`${metrics.readyDocuments || 0} Active & Ready`}
          icon={FileText}
          color="blue"
        />

        <MetricCard
          title="Indexed Vectors"
          value={loading ? '...' : metrics.indexedVectors || 0}
          subtitle="Semantic Chunk Embeddings"
          icon={Database}
          color="purple"
        />

        <MetricCard
          title="Student Questions"
          value={loading ? '...' : metrics.totalQuestions || 0}
          subtitle={`${metrics.questionsToday || 0} asked today`}
          icon={MessageSquare}
          color="amber"
        />

        <MetricCard
          title="Student Satisfaction"
          value={loading ? '...' : `${metrics.feedback?.satisfactionRate || 100}%`}
          subtitle={`${metrics.feedback?.helpful || 0} 👍 helpful ratings`}
          icon={ThumbsUp}
          color="green"
        />
      </div>

      {/* Category Distribution Breakdown */}
      {stats?.categoryDistribution && stats.categoryDistribution.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Knowledge Base Categories Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.categoryDistribution.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-sm"
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">{cat.category}</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white block">{cat.count} docs</span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono font-semibold">{cat.chunks} chunks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Recent Documents & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentDocuments documents={stats?.recentDocuments || []} />
        <ActivityList activities={stats?.recentActivity || []} />
      </div>
    </div>
  );
}

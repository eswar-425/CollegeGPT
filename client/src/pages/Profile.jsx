import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { healthApi } from '../services/api';
import {
  User,
  Shield,
  Building2,
  Mail,
  Calendar,
  Activity,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  School,
} from 'lucide-react';

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      const checkHealth = async () => {
        try {
          const res = await healthApi.getHealth();
          setHealthData(res);
        } catch (err) {
          setHealthData(null);
        } finally {
          setLoadingHealth(false);
        }
      };
      checkHealth();
    }
  }, [isAdmin]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fade-in transition-colors duration-200">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <School className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> College / Institution
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={user?.collegeName || 'General College'}>
            {user?.collegeName || 'General College'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Department
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.department || 'General'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Account Status
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{user?.role || 'Student'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Member Since
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
          </p>
        </div>
      </div>

      {/* STUDENT VIEW: Official University Knowledge Access & Policy Card */}
      {!isAdmin && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Official Institutional Knowledge Base</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Direct student access to verified college circulars and guidelines</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Accredited Knowledge Scope
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                All inquiries about course regulations, fee circulars, examination schedules, hostel policies, and campus placement criteria are answered strictly from validated institutional publications.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Institutional Guarantee
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Every AI response is accompanied by official citations linking to the exact source handbook or circular, ensuring transparency and factual accuracy for your academic requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN-ONLY VIEW: System, LLM & Vector Database Diagnostics */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">System & RAG Engine Status</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live operational status of AI models and vector stores (Administrator Only)</p>
              </div>
            </div>

            <div>
              {healthData ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> Checking Connection...
                </span>
              )}
            </div>
          </div>

          {healthData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  AI / LLM Configuration
                </div>
                <div className="text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Provider: <span className="text-slate-800 dark:text-slate-200 font-mono">{healthData.ai?.llmProvider}</span></p>
                  <p>Model: <span className="text-slate-800 dark:text-slate-200 font-mono">{healthData.ai?.llmModel}</span></p>
                  <p>Embedder: <span className="text-slate-800 dark:text-slate-200 font-mono">{healthData.ai?.embeddingProvider}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Vector Store & Database
                </div>
                <div className="text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Store: <span className="text-slate-800 dark:text-slate-200 font-mono">{healthData.vectorStore?.type}</span></p>
                  <p>Total Chunks Indexed: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{healthData.vectorStore?.totalVectors || 0}</span></p>
                  <p>Database: <span className="text-slate-800 dark:text-slate-200 font-mono">{healthData.database?.host}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

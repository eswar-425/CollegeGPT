import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    green: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    purple: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  };

  const currentStyle = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-400 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-lg flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className={`p-3 rounded-xl bg-gradient-to-br border ${currentStyle}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

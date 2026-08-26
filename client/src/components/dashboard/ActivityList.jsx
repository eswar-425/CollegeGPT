import React from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';

export default function ActivityList({ activities = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        Recent Student Inquiries
      </h3>

      <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No student inquiries recorded yet.</div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="py-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <User className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  {act.user}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-1 italic">
                "{act.question}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

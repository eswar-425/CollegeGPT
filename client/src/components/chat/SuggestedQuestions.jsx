import React from 'react';
import { Sparkles, ArrowUpRight, GraduationCap, Home, Award, Calendar, BookOpen, Briefcase } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: GraduationCap,
    category: 'Academics',
    question: 'What is the minimum attendance required for semester examinations?',
  },
  {
    icon: Home,
    category: 'Hostel & Fees',
    question: 'What are the hostel fees for double and single occupancy rooms?',
  },
  {
    icon: Calendar,
    category: 'Examinations',
    question: 'When do odd and even semester theory examinations begin?',
  },
  {
    icon: Award,
    category: 'Scholarships',
    question: 'What institutional scholarships and CGPA requirements are available?',
  },
  {
    icon: Briefcase,
    category: 'Placements',
    question: 'What is the placement eligibility criteria and Dream offer policy?',
  },
  {
    icon: BookOpen,
    category: 'Library',
    question: 'What are the digital library timings and book borrowing privileges?',
  },
];

export default function SuggestedQuestions({ onSelectQuestion }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Instant Knowledge Search
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How can I help you today?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Ask questions grounded in official college brochures, rules, fees, and circulars.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(item.question)}
              className="text-left p-4 rounded-xl bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500/40 transition-all duration-200 group flex items-start justify-between gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.category}</span>
                </div>
                <div className="text-xs text-slate-800 dark:text-slate-200 font-medium group-hover:text-brand-600 dark:group-hover:text-white transition-colors line-clamp-2">
                  {item.question}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-600 text-slate-500 dark:text-slate-400 group-hover:text-white transition-all shrink-0 mt-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

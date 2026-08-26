import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, Building2, Tag } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const [department, setDepartment] = useState('All');
  const [category, setCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage({
      message: input.trim(),
      departmentFilter: department === 'All' ? undefined : department,
      categoryFilter: category === 'All' ? undefined : category,
    });

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Optional Filters Bar */}
      {showFilters && (
        <div className="mb-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-fade-in text-xs shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Department:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-sm dark:shadow-none"
            >
              <option value="All">All Departments</option>
              <option value="General / College-wide">General / College-wide</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-sm dark:shadow-none"
            >
              <option value="All">All Categories</option>
              <option value="Academics">Academics</option>
              <option value="Hostel">Hostel & Housing</option>
              <option value="Fees">Fees & Tuition</option>
              <option value="Examinations">Examinations</option>
              <option value="Scholarships">Scholarships</option>
              <option value="Placements">Placements</option>
              <option value="Library">Library</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 shadow-lg dark:shadow-xl transition-all"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Ask anything about college regulations, hostel fees, exam schedules..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 pt-3.5 pb-12 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none min-h-[52px] max-h-[180px]"
        />

        {/* Action Bar */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showFilters || department !== 'All' || category !== 'All'
                ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-300 dark:border-brand-500/40 text-brand-700 dark:text-brand-300'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Filters</span>
            {(department !== 'All' || category !== 'All') && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all duration-150 disabled:opacity-40 disabled:hover:bg-brand-600 active:scale-95 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      <div className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
        CollegeGPT answers are strictly grounded in official documents. Double-check important dates with administration.
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  X,
} from 'lucide-react';

export default function Sidebar({
  conversations = [],
  activeId = null,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClose,
  isLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'New College Inquiry').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-72 sm:w-80 max-w-[85vw] flex flex-col h-full bg-slate-100/95 dark:bg-[#0B1511]/95 border-r border-slate-200 dark:border-slate-800/80 shrink-0 transition-colors duration-200 backdrop-blur-xl">
      {/* Header & New Chat Button */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800/60 flex flex-col gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-600/25 transition-all duration-200 active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>

          {/* Close Sidebar button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 md:hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors shadow-sm dark:shadow-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-1">
        <div className="px-2 py-1 text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Your Conversations
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-xs text-slate-500">Loading history...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {searchQuery ? 'No matching conversations' : 'No previous conversations yet. Start asking!'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = String(conv._id || conv.id) === String(activeId);
            return (
              <div
                key={conv._id || conv.id}
                onClick={() => onSelectConversation(conv._id || conv.id)}
                className={`group relative flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-brand-100 dark:bg-brand-600/15 border border-brand-300 dark:border-brand-500/30 text-brand-900 dark:text-white font-medium shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                      isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="text-xs truncate block">
                    {conv.title || 'College Inquiry'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this conversation?')) {
                      onDeleteConversation(conv._id || conv.id);
                    }
                  }}
                  className="opacity-70 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

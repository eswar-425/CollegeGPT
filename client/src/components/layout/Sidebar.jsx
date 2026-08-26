import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
} from 'lucide-react';

export default function Sidebar({
  conversations = [],
  activeId = null,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'New College Inquiry').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 flex flex-col h-full bg-slate-100/90 dark:bg-[#0B1511] border-r border-slate-200 dark:border-slate-800/80 shrink-0 transition-colors duration-200">
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex flex-col gap-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all duration-200 active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Conversation
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors shadow-sm dark:shadow-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
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
                className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-brand-100 dark:bg-brand-600/15 border border-brand-300 dark:border-brand-500/30 text-brand-900 dark:text-white font-medium shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
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
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all"
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

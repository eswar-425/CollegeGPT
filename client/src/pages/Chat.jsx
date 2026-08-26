import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import SuggestedQuestions from '../components/chat/SuggestedQuestions';
import { conversationApi, chatApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PanelLeftClose, PanelLeft, Sparkles, MessageSquare } from 'lucide-react';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage]);

  // Load conversations list
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await conversationApi.getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      // Non-fatal
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Sync activeConversationId with URL parameter
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId]);

  // Load messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        const res = await chatApi.getMessages(activeConversationId);
        setMessages(res.messages || []);
      } catch (err) {
        toast.error('Failed to load conversation history.');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Start new chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    navigate('/chat');
  };

  // Select existing chat
  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    navigate(`/chat/${id}`);
  };

  // Delete conversation
  const handleDeleteConversation = async (id) => {
    try {
      await conversationApi.deleteConversation(id);
      toast.success('Conversation deleted.');
      setConversations((prev) => prev.filter((c) => (c._id || c.id) !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch (err) {
      toast.error('Could not delete conversation.');
    }
  };

  // Send message
  const handleSendMessage = async ({ message, departmentFilter, categoryFilter }) => {
    if (!message.trim() || sendingMessage) return;

    // Optimistically show user message
    const tempUserMessage = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setSendingMessage(true);

    try {
      const res = await chatApi.sendMessage({
        conversationId: activeConversationId,
        message,
        departmentFilter,
        categoryFilter,
      });

      // Update active ID if new
      if (res.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
        navigate(`/chat/${res.conversationId}`, { replace: true });
        fetchConversations();
      }

      // Append assistant message
      if (res.message) {
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempUserMessage._id),
          res.userMessage || tempUserMessage,
          res.message,
        ]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to get answer.');
      // Remove optimistic message if failure
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMessage._id));
    } finally {
      setSendingMessage(false);
    }
  };

  // Submit feedback
  const handleFeedbackSubmit = async (messageId, { rating, comment }) => {
    try {
      await chatApi.submitFeedback(messageId, { rating, comment });
      toast.success('Thank you! Feedback recorded.');
      // Update local message feedback state
      setMessages((prev) =>
        prev.map((m) =>
          (m._id || m.id) === messageId
            ? { ...m, feedback: { rating, comment, submittedAt: new Date() } }
            : m
        )
      );
    } catch (err) {
      toast.error('Failed to submit feedback.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#08100D] overflow-hidden transition-colors duration-200">
      {/* Sidebar (Desktop + Mobile Toggle) */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none'
        } transition-all duration-300 z-30 fixed md:static inset-y-16 md:inset-auto h-[calc(100vh-4rem)]`}
      >
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
            isLoading={loadingConversations}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-slate-50/50 dark:bg-transparent">
        {/* Chat Header Bar */}
        <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {conversations.find((c) => (c._id || c.id) === activeConversationId)?.title ||
                  'College Information Assistant'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Verified College Knowledge Base
            </span>
          </div>
        </div>

        {/* Message stream or Suggested Questions */}
        <div className="flex-1 overflow-y-auto">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Loading conversation history...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <SuggestedQuestions onSelectQuestion={(q) => handleSendMessage({ message: q })} />
          ) : (
            <div className="max-w-4xl mx-auto divide-y divide-slate-200 dark:divide-slate-800/30">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg._id || idx}
                  message={msg}
                  onFeedbackSubmit={handleFeedbackSubmit}
                />
              ))}

              {/* RAG Typing / Searching Indicator */}
              {sendingMessage && (
                <div className="py-5 px-4 sm:px-6 flex gap-4 bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/40 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span>Searching Knowledge Base & Formulating Grounded Answer...</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={sendingMessage} />
      </main>
    </div>
  );
}

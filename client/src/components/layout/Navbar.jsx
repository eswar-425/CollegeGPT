import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  MessageSquare,
  FileText,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Sparkles,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#08100D]/90 backdrop-blur-md transition-colors duration-200 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                College<span className="text-brand-600 dark:text-brand-400">GPT</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> {isAdmin ? 'Admin Hub' : 'Campus Assistant'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">College Information Assistant</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {isAuthenticated && (
            <>
              <Link
                to="/chat"
                className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  location.pathname.startsWith('/chat')
                    ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Chat Assistant
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      isActive('/admin')
                        ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Hub
                  </Link>
                  <Link
                    to="/admin/documents"
                    className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      isActive('/admin/documents') || isActive('/admin/documents/upload')
                        ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Knowledge Base
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Right side CTA / User profile & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-slate-700 transition-all"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                }`}
              >
                <Shield className="w-3 h-3" />
                {isAdmin ? 'Admin' : 'Student'}
              </span>

              {/* Profile Link */}
              <Link
                to="/profile"
                className={`p-2 rounded-lg border transition-all ${
                  isActive('/profile')
                    ? 'bg-slate-100 dark:bg-slate-800 border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                title="Account Profile"
              >
                <UserIcon className="w-4 h-4" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900/50 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md shadow-brand-600/20 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
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
  Menu,
  X,
  UploadCloud,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#08100D]/95 backdrop-blur-md transition-colors duration-200 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight shrink-0">
                College<span className="text-brand-600 dark:text-brand-400">GPT</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 items-center gap-1 shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> {isAdmin ? 'Admin' : 'Assistant'}
              </span>
            </div>
            <span className="hidden lg:block text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              College Information Assistant
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Large screens >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {isAuthenticated && (
            <>
              <Link
                to="/chat"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs sm:text-sm ${
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
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs sm:text-sm ${
                      isActive('/admin')
                        ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Hub
                  </Link>
                  <Link
                    to="/admin/documents"
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs sm:text-sm ${
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

        {/* Right Controls: Theme Toggle & User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-all shrink-0"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Role badge (XL Screens) */}
              <span
                className={`hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
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
                onClick={closeMobileMenu}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                  isActive('/profile')
                    ? 'bg-slate-100 dark:bg-slate-800 border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Account Profile"
              >
                <UserIcon className="w-4 h-4" />
              </Link>

              {/* Logout Button (Hidden on small mobile, visible in dropdown) */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile / Tablet Menu Toggle (Visible on screens < 1024px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg lg:hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 focus:outline-none shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link
                to="/login"
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md shadow-brand-600/20 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Drawer Dropdown Menu (< 1024px) */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#08100D]/98 backdrop-blur-2xl px-4 py-3 space-y-1.5 animate-fade-in shadow-2xl">
          <div className="pb-2 mb-1.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Account'}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isAdmin ? 'Admin' : 'Student'}
            </span>
          </div>

          <Link
            to="/chat"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              location.pathname.startsWith('/chat')
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span>Chat Assistant</span>
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/admin')
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-500" />
                <span>Administrator Hub</span>
              </Link>
              <Link
                to="/admin/documents"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/admin/documents')
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Knowledge Base Documents</span>
              </Link>
              <Link
                to="/admin/documents/upload"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/admin/documents/upload')
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-emerald-500" />
                <span>Upload New Document</span>
              </Link>
            </>
          )}

          <Link
            to="/profile"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/profile')
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span>My Account Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}

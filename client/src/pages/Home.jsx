import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  FileSearch,
  CheckCircle,
  FileText,
  MessageSquare,
  Lock,
  Building2,
  Calendar,
  CreditCard,
  Home as HomeIcon,
  Award,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CAMPUS_TOPICS = [
  {
    icon: GraduationCap,
    title: 'Academic Policies & Grading',
    description: 'Attendance rules, credit requirements, grading scales, and course prerequisites.',
    sample: 'What is the minimum attendance required to write semester exams?',
    color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  },
  {
    icon: CreditCard,
    title: 'Fee Circulars & Payments',
    description: 'Tuition fees, semester payment schedules, hostel dues, and fine policies.',
    sample: 'What are the semester tuition and hostel fee payment deadlines?',
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  },
  {
    icon: Calendar,
    title: 'Examinations & Calendars',
    description: 'Mid-term and end-semester dates, hall ticket guidelines, and re-evaluations.',
    sample: 'When do end-semester theory examinations begin for the current year?',
    color: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  },
  {
    icon: HomeIcon,
    title: 'Hostel & Residence Life',
    description: 'Room allocations, occupancy fee structures, mess menus, and curfew guidelines.',
    sample: 'What are the hostel residence rules and curfew timings for students?',
    color: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  },
  {
    icon: Award,
    title: 'Scholarships & Financial Aid',
    description: 'Institutional merit scholarships, CGPA requirements, and application procedures.',
    sample: 'What scholarships are available for high-achieving students?',
    color: 'from-rose-500/20 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
  },
  {
    icon: Briefcase,
    title: 'Placements & Career Cell',
    description: 'Placement eligibility criteria, interview schedules, and training guidelines.',
    sample: 'What is the CGPA eligibility criteria for campus placement drives?',
    color: 'from-indigo-500/20 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
  },
];

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleTopicClick = (query) => {
    navigate('/chat');
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-[#08100D] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] sm:h-[500px] bg-gradient-to-b from-brand-600/15 dark:from-brand-600/20 via-teal-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="w-full pt-12 sm:pt-20 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Knowledge Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-8 animate-fade-in shadow-sm dark:shadow-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>University Campus & Academic Knowledge System</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
          Your Campus Information, <br />
          <span className="gradient-text">Accurate & Verified with Citations</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          CollegeGPT provides instant answers for students and faculty. Query official
          academic regulations, fee handbooks, hostel policies, and exam schedules with zero guesswork.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-16 w-full">
          <Link
            to={isAuthenticated ? '/chat' : '/login'}
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isAuthenticated ? 'Open Campus Assistant' : 'Start Asking Questions'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {isAuthenticated ? (
            isAdmin && (
              <Link
                to="/admin"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm dark:shadow-none"
              >
                Administrator Hub
              </Link>
            )
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm dark:shadow-none"
            >
              Sign In to Account
            </Link>
          )}
        </div>
      </section>

      {/* Campus Knowledge Directory Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            What Can You Ask About?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every response is grounded in approved institutional documents and circulars
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAMPUS_TOPICS.map((topic, idx) => {
            const Icon = topic.icon;
            return (
              <div
                key={idx}
                onClick={() => handleTopicClick(topic.sample)}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br border w-fit mb-4 ${topic.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {topic.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span className="truncate text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{topic.sample}"
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Why CollegeGPT Stands Out</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Designed specifically for institutional transparency and student support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500/40 transition-all shadow-sm">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 w-fit mb-4 border border-brand-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Zero-Hallucination Policy</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If an answer is not in the uploaded official college documents, CollegeGPT explicitly tells you to check with the administration instead of guessing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all shadow-sm">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-4 border border-indigo-500/20">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Official Document Citations</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every single response includes interactive source cards with the document title, category, and exact page number for complete verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/40 transition-all shadow-sm">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-4 border border-purple-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Secure Institutional Knowledge</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All documents are securely partitioned with role-based access control, ensuring verified academic information is accessible campus-wide.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-500">
        CollegeGPT • Campus Information Assistant • Grounded in Institutional Circulars & Guidelines
      </footer>
    </div>
  );
}

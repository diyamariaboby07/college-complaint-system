import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  BellRing,
  Building,
  Users,
  Star,
} from 'lucide-react';
import { useAuth } from '../store/authStore';

export const Landing = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight">CampusCare</span>
              <span className="text-[11px] text-slate-400 block -mt-1">Helpdesk Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-all shadow-brand-500/25"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Modern Campus Grievance & Facility Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            College Complaint Management System
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Report classroom, lab, hostel, Wi-Fi, and campus facility issues seamlessly. Track resolution status in real-time, receive instant administrator updates, and provide direct feedback.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Student Login
            </Link>

            <Link
              to="/register"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-brand-600" />
              Student Registration
            </Link>

            <Link
              to="/login?role=admin"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Admin Portal
            </Link>
          </div>

          {/* Demo Credentials Helper Pill */}
          <div className="inline-block pt-6">
            <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-center gap-4">
              <span className="font-bold text-slate-800">Quick Demo Accounts:</span>
              <span>Admin: <strong className="font-mono text-slate-900">admin@college.edu</strong> / <span className="font-mono">Admin@123</span></span>
              <span className="text-slate-300">|</span>
              <span>Student: <strong className="font-mono text-slate-900">alex@college.edu</strong> / <span className="font-mono">Student@123</span></span>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 sm:mt-20">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Instant Ticket Routing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-categorization with AI, smart duplicate warning, and direct assignment to IT, Maintenance, Hostel, and Transport staff.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Live Timeline & Alerts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time Socket.IO status updates, visual progression timelines, chronological staff notes, and automatic overdue escalations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Resolution & Rating</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students inspect resolution details, rate support performance with 1–5 stars, and help track department-level turnaround times.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          CampusCare College Complaint Management System — Single Source of Truth Specification.
        </div>
      </footer>
    </div>
  );
};

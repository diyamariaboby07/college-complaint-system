import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ShieldCheck, GraduationCap, Building, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../store/authStore';
import { Navbar } from '../components/Navbar/Navbar';
import { Sidebar } from '../components/Sidebar/Sidebar';

export const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              User Profile
            </h1>
            <p className="text-xs text-slate-500">
              Account credentials, college affiliation, and portal settings
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 max-w-3xl space-y-6">
            {/* User Avatar & Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{user?.name}</h2>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isAdmin
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  {user?.name}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  {user?.email}
                </span>
              </div>

              {user?.studentId && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Student ID / Roll No.
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {user.studentId}
                  </span>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-brand-600" />
                  {user?.department || 'General'}
                </span>
              </div>

              {user?.year && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Academic Year
                  </span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    {user.year}
                  </span>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active & Verified
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">CampusCare v1.0.0</span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

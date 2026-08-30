import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  ShieldCheck,
  BarChart3,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', path: '/student/complaints', icon: FileText },
    { name: 'New Complaint', path: '/student/complaints/new', icon: PlusCircle, highlight: true },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Analytics Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Complaint Tickets', path: '/admin/complaints', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Admin Profile', path: '/profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
          <div>
            {/* Mobile close button */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 lg:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Menu Navigation
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Header Banner */}
            <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                    isAdmin ? 'bg-indigo-600' : 'bg-brand-500'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {isAdmin ? 'Admin Control' : 'Student Desk'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {user?.department || (isAdmin ? 'Campus Ops' : 'General')}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav list */}
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    end={link.path === '/student/dashboard' || link.path === '/admin/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-xs'
                          : link.highlight
                          ? 'text-brand-700 bg-brand-50/50 hover:bg-brand-100/70 border border-dashed border-brand-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card / Help Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>24/7 Campus Response</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Urgent campus emergencies can also be reported to helpdesk@college.edu
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

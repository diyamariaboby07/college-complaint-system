import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  User,
  ShieldCheck,
  GraduationCap,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { NotificationDrawer } from '../NotificationDrawer/NotificationDrawer';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand & Mobile Hamburger */}
            <div className="flex items-center gap-3">
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Toggle navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
                    CampusCare
                    <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      {isAdmin ? 'Admin' : 'Portal'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:block">College Complaint Management</span>
                </div>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Submit button for student */}
              {!isAdmin && (
                <Link
                  to="/student/complaints/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-lg shadow-xs transition-all hover:shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Complaint
                </Link>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => setShowDrawer(true)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-rose-600 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Profile & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-300">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user?.role || 'Member'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        {user?.studentId && (
                          <p className="text-[10px] text-brand-600 font-mono mt-0.5">
                            ID: {user.studentId}
                          </p>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          handleLogout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Slide Drawer */}
      <NotificationDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
};

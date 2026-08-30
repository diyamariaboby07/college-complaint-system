import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Info,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../store/authStore';
import { Navbar } from '../components/Navbar/Navbar';
import { Sidebar } from '../components/Sidebar/Sidebar';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (item) => {
    if (!item.isRead) {
      handleMarkRead(item._id);
    }
    if (item.complaintId || item.complaintFormattedId) {
      const targetId = item.complaintFormattedId || item.complaintId;
      if (isAdmin) {
        navigate(`/admin/complaints/${targetId}`);
      } else {
        navigate(`/student/complaints/${targetId}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Notification Center
              </h1>
              <p className="text-xs text-slate-500">
                Live alerts, complaint updates, and administrative assignments
              </p>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <CheckCheck className="w-4 h-4 text-brand-600" />
                Mark All as Read
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-16 text-center space-y-2 text-slate-400">
                <Bell className="w-10 h-10 mx-auto stroke-1" />
                <p className="text-sm font-semibold text-slate-700">No notifications found</p>
                <p className="text-xs">You're all caught up with recent events.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                      !item.isRead ? 'bg-brand-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-1">
                        {item.type === 'complaint_resolved' ? (
                          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        ) : item.type === 'complaint_escalated' ? (
                          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        ) : item.type === 'admin_comment' ? (
                          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                            <Info className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                          {item.complaintFormattedId && (
                            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.complaintFormattedId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

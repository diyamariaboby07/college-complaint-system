import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCheck, Bell, MessageSquare, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../store/authStore';

export const NotificationDrawer = ({ isOpen, onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
        const unread = res.data.data.filter((n) => !n.isRead).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Listen to real-time notification socket event
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (onUnreadCountChange) {
        onUnreadCountChange((prevCount) => (prevCount || 0) + 1);
      }
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (onUnreadCountChange) {
        onUnreadCountChange((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickNotification = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id);
    }
    onClose();
    if (item.complaintId || item.complaintFormattedId) {
      const targetId = item.complaintFormattedId || item.complaintId;
      if (user?.role === 'admin') {
        navigate(`/admin/complaints/${targetId}`);
      } else {
        navigate(`/student/complaints/${targetId}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500">Live campus updates and alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold px-2 py-1 rounded-md hover:bg-brand-50 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
                <Bell className="w-10 h-10 stroke-1 text-slate-300 mb-2" />
                <p className="font-medium text-slate-600 text-sm">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You will be notified whenever your complaint status changes.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                return (
                  <div
                    key={item._id}
                    onClick={() => handleClickNotification(item)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all duration-150 relative my-1 ${
                      item.isRead
                        ? 'hover:bg-slate-50 text-slate-700'
                        : 'bg-brand-50/40 hover:bg-brand-50/70 text-slate-900 font-medium'
                    }`}
                  >
                    {!item.isRead && (
                      <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-brand-500"></span>
                    )}
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {item.type === 'complaint_resolved' ? (
                          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : item.type === 'complaint_escalated' ? (
                          <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : item.type === 'admin_comment' ? (
                          <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 pr-3">
                        <div className="flex items-baseline justify-between gap-1">
                          <h4 className="text-xs font-semibold">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        {item.complaintFormattedId && (
                          <span className="inline-block mt-2 text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {item.complaintFormattedId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

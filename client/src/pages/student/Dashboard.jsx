import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { complaintAPI, notificationAPI } from '../../services/api';
import { StatisticsCards } from '../../components/StatisticsCards/StatisticsCards';
import { ComplaintCard } from '../../components/ComplaintCard/ComplaintCard';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getMyComplaints();
      if (res.data && res.data.data) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === 'Submitted').length,
    underReview: complaints.filter((c) => c.status === 'Under Review').length,
    assigned: complaints.filter((c) => c.status === 'Assigned').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
    pending: complaints.filter((c) => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length,
  };

  const recentComplaints = complaints.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Student Grievance Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
                Track your active campus issue reports or file a new ticket for immediate helpdesk review.
              </p>
            </div>

            <Link
              to="/student/complaints/new"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-brand-700 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              File New Complaint
            </Link>
          </div>

          {/* Metric Stats Cards */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Overview Summary
            </h2>
            <StatisticsCards stats={stats} isAdmin={false} />
          </div>

          {/* Recent Complaints Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Recent Complaints</h2>
                <p className="text-xs text-slate-500">Recently filed campus tickets</p>
              </div>

              {complaints.length > 0 && (
                <Link
                  to="/student/complaints"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  View All ({complaints.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No complaints submitted yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Notice an issue with Wi-Fi, classroom equipment, hostel amenities, or cleanliness?
                </p>
                <Link
                  to="/student/complaints/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-brand-700 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Submit Your First Complaint
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentComplaints.map((comp) => (
                  <ComplaintCard key={comp._id} complaint={comp} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

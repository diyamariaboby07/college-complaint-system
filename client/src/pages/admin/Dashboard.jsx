import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Loader2,
  Building,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { StatisticsCards } from '../../components/StatisticsCards/StatisticsCards';
import { AnalyticsCharts } from '../../components/AnalyticsCharts/AnalyticsCharts';
import { ComplaintCard } from '../../components/ComplaintCard/ComplaintCard';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [catStats, setCatStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, deptRes, catRes, statusRes, complaintsRes] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getDepartmentStats(),
        adminAPI.getCategoryStats(),
        adminAPI.getStatusStats(),
        adminAPI.getComplaints(),
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (deptRes.data?.data) setDeptStats(deptRes.data.data);
      if (catRes.data?.data) setCatStats(catRes.data.data);
      if (statusRes.data?.data) setStatusStats(statusRes.data.data);
      if (complaintsRes.data?.data) {
        const all = complaintsRes.data.data;
        setRecentComplaints(all.slice(0, 4));
        setEscalatedComplaints(
          all.filter((c) => c.isEscalated && c.status !== 'Resolved' && c.status !== 'Closed')
        );
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Central Helpdesk Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Campus Facility Analytics & Operations
              </h1>
              <p className="text-xs text-slate-500">
                Monitor student reports, department SLAs, and ticket turnaround times
              </p>
            </div>

            <Link
              to="/admin/complaints"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Manage All Tickets
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-24 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              <StatisticsCards stats={stats} isAdmin={true} />

              {/* Escalated Tickets Alert Banner */}
              {escalatedComplaints.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-rose-800 font-bold">
                      <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                      <h2 className="text-sm font-bold">
                        {escalatedComplaints.length} Overdue Escalated Complaint
                        {escalatedComplaints.length > 1 ? 's' : ''} Require Immediate Attention
                      </h2>
                    </div>

                    <Link
                      to="/admin/complaints?isEscalated=true"
                      className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                    >
                      Filter Escalated
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {escalatedComplaints.map((c) => (
                      <div
                        key={c._id}
                        className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono font-bold text-slate-900 block">{c.complaintId}</span>
                          <span className="text-slate-600 truncate block">{c.title}</span>
                          <span className="text-[10px] text-slate-400">Dept: {c.department}</span>
                        </div>
                        <Link
                          to={`/admin/complaints/${c.complaintId || c._id}`}
                          className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-[11px] shrink-0"
                        >
                          Resolve
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Charts & Department Breakdown */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Facility Breakdown & Distribution
                </h2>
                <AnalyticsCharts
                  departmentStats={deptStats}
                  categoryStats={catStats}
                  statusStats={statusStats}
                />
              </div>

              {/* Recent Activity List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Recently Registered Tickets</h2>
                    <p className="text-xs text-slate-500">Incoming campus reports</p>
                  </div>

                  <Link
                    to="/admin/complaints"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentComplaints.map((comp) => (
                    <ComplaintCard key={comp._id} complaint={comp} />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

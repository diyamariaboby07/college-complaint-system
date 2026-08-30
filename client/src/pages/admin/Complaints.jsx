import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Loader2,
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  User,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge/PriorityBadge';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const AdminComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [department, setDepartment] = useState('all');
  const [isEscalated, setIsEscalated] = useState(searchParams.get('isEscalated') || 'all');

  const fetchAdminComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getComplaints({
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? priority : undefined,
        department: department !== 'all' ? department : undefined,
        isEscalated: isEscalated !== 'all' ? isEscalated : undefined,
      });

      if (res.data && res.data.data) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminComplaints();
  }, [status, category, priority, department, isEscalated]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdminComplaints();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setCategory('all');
    setPriority('all');
    setDepartment('all');
    setIsEscalated('all');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                All Campus Complaints & Work Orders
              </h1>
              <p className="text-xs text-slate-500">
                Filter, assign staff, progress status, and log resolutions
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID (CMP-001), Title, Student Name, or Location..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              {/* Department */}
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Departments</option>
                <option value="Administration">Administration</option>
                <option value="IT Department">IT Department</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Hostel">Hostel</option>
                <option value="Transportation">Transportation</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Unassigned">Unassigned</option>
              </select>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Categories</option>
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Hostel">Hostel</option>
                <option value="Wi-Fi / Internet">Wi-Fi / Internet</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Transportation">Transportation</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Other">Other</option>
              </select>

              {/* Priority */}
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              {/* Escalated Toggle */}
              <select
                value={isEscalated}
                onChange={(e) => setIsEscalated(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Overdue Status</option>
                <option value="true">⚠️ Escalated Only</option>
                <option value="false">Normal</option>
              </select>

              {(status !== 'all' || category !== 'all' || priority !== 'all' || department !== 'all' || isEscalated !== 'all' || search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 flex items-center gap-1 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Complaints Table (Desktop) / Cards (Mobile) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">Tickets ({complaints.length})</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center space-y-2 text-slate-400">
                <FileText className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-sm font-semibold text-slate-700">No complaints matching query</p>
                <p className="text-xs">Adjust your search terms or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Title & Location</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department & Staff</th>
                      <th className="py-3 px-4 text-center">Priority</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c) => {
                      const formattedDate = new Date(c.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Ticket ID & Category */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-slate-900 block">
                                {c.complaintId}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {c.category}
                              </span>
                              {c.isEscalated && (
                                <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 mt-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Escalated
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Title & Location */}
                          <td className="py-3.5 px-4 align-top max-w-xs">
                            <Link
                              to={`/admin/complaints/${c.complaintId || c._id}`}
                              className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1"
                            >
                              {c.title}
                            </Link>
                            <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                              {c.location}
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Filed: {formattedDate}
                            </span>
                          </td>

                          {/* Student */}
                          <td className="py-3.5 px-4 align-top">
                            <span className="font-semibold text-slate-800 block">
                              {c.studentId?.name || 'Student'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {c.studentId?.studentId || c.studentId?.email || '-'}
                            </span>
                          </td>

                          {/* Department & Staff */}
                          <td className="py-3.5 px-4 align-top">
                            <span className="font-semibold text-slate-800 block">
                              {c.department || 'Unassigned'}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[120px] block">
                              {c.assignedStaff || 'No staff assigned'}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <PriorityBadge priority={c.priority} size="sm" />
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <StatusBadge status={c.status} size="sm" />
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 align-top text-right">
                            <Link
                              to={`/admin/complaints/${c.complaintId || c._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              Manage
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

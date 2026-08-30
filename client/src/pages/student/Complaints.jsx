import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, FileText, Loader2, X } from 'lucide-react';
import { complaintAPI } from '../../services/api';
import { ComplaintCard } from '../../components/ComplaintCard/ComplaintCard';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getMyComplaints({
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? priority : undefined,
      });
      if (res.data && res.data.data) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, category, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setCategory('all');
    setPriority('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                My Complaint History
              </h1>
              <p className="text-xs text-slate-500">
                All campus grievances and service requests filed from your profile
              </p>
            </div>

            <Link
              to="/student/complaints/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Complaint
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Complaint ID (e.g. CMP-001), keywords, or location..."
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

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Status filter */}
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

              {/* Category filter */}
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

              {/* Priority filter */}
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

              {(status !== 'all' || category !== 'all' || priority !== 'all' || search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 flex items-center gap-1 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Complaints Results List */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
              <span>Showing {complaints.length} tickets</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No complaints found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your search query or removing active status/category filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map((comp) => (
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

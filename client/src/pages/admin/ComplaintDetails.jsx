import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  Star,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Loader2,
  Paperclip,
  Clock,
  Shield,
  MessageSquare,
  Flame,
  Check,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge/PriorityBadge';
import { ComplaintTimeline } from '../../components/ComplaintTimeline/ComplaintTimeline';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

const departmentStaffMap = {
  Administration: ['Administrative Officer', 'Registrar Assistant', 'Estate Manager'],
  'IT Department': ['IT Administrator', 'Network Specialist', 'Hardware Technician'],
  Maintenance: ['Maintenance Officer', 'Electrician Lead', 'Plumbing Supervisor'],
  Hostel: ['Hostel Warden', 'Assistant Warden', 'Mess In-charge'],
  Transportation: ['Transport Supervisor', 'Fleet Coordinator', 'Safety Officer'],
  Housekeeping: ['Sanitation Lead', 'Facility Supervisor', 'Janitor Lead'],
  Laboratory: ['Lab Assistant', 'Senior Systems Analyst', 'Instrumentation Lead'],
  Unassigned: [''],
};

export const AdminComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form Management State
  const [status, setStatus] = useState('Submitted');
  const [priority, setPriority] = useState('Low');
  const [department, setDepartment] = useState('Unassigned');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getComplaintById(id);
      if (res.data && res.data.data) {
        const comp = res.data.data.complaint;
        setComplaint(comp);
        setUpdates(res.data.data.updates || []);

        setStatus(comp.status);
        setPriority(comp.priority);
        setDepartment(comp.department || 'Unassigned');
        setAssignedStaff(comp.assignedStaff || '');
        setAdminComment(comp.adminComment || '');
        setResolutionDetails(comp.resolutionDetails || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminAPI.updateComplaint(complaint._id, {
        status,
        priority,
        department,
        assignedStaff,
        adminComment,
        resolutionDetails,
      });

      if (res.data?.data) {
        setComplaint(res.data.data);
        showToast('Ticket changes updated and student notified.');
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProgressComment = async (e) => {
    e.preventDefault();
    if (!adminComment.trim()) return;

    try {
      setSaving(true);
      await adminAPI.addComment(complaint._id, {
        message: adminComment,
        status,
      });
      setAdminComment('');
      showToast('Progress update logged to timeline.');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionDetails.trim()) {
      alert('Please specify the resolution details before marking as resolved.');
      return;
    }

    try {
      setSaving(true);
      const res = await adminAPI.resolveComplaint(complaint._id, {
        resolutionDetails,
      });
      if (res.data?.data) {
        setComplaint(res.data.data);
        setStatus('Resolved');
        showToast('Complaint resolved successfully!');
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEscalation = async () => {
    try {
      setSaving(true);
      const nextEscalated = !complaint.isEscalated;
      const res = await adminAPI.toggleEscalate(complaint._id, {
        isEscalated: nextEscalated,
      });
      if (res.data?.data) {
        setComplaint(res.data.data);
        showToast(nextEscalated ? 'Ticket flagged as Escalated.' : 'Ticket de-escalated.');
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update escalation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Breadcrumbs & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Complaint Tickets
            </Link>

            {complaint && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleEscalation}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    complaint.isEscalated
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  {complaint.isEscalated ? 'Escalated ⚠️' : 'Flag Escalation'}
                </button>
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} size="lg" />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-24 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-3xl border border-rose-200 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">{error}</h3>
              <Link
                to="/admin/complaints"
                className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Return to Table
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Details & Timeline (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Complaint Overview Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm px-3 py-1 bg-slate-100 text-slate-900 rounded-xl border border-slate-200">
                        {complaint.complaintId}
                      </span>
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg">
                        {complaint.category}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-medium">
                      Registered on {new Date(complaint.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {complaint.title}
                    </h1>
                  </div>

                  {/* Student Details Pill */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{complaint.studentId?.name}</span>
                      <span className="text-slate-400 ml-1">({complaint.studentId?.email})</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                      <span>ID: {complaint.studentId?.studentId || 'N/A'}</span>
                      <span>Dept: {complaint.studentId?.department || 'General'}</span>
                      <span>Year: {complaint.studentId?.year || 'N/A'}</span>
                    </div>
                  </div>

                  {/* AI Summary Banner */}
                  {complaint.summary && (
                    <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-brand-900 block mb-0.5">AI Summary:</span>
                        <p className="text-brand-800 leading-relaxed">{complaint.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Full Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Description & Context
                    </h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Campus Location */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Campus Location
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{complaint.location}</span>
                    </div>
                  </div>

                  {/* Image Attachment Preview */}
                  {complaint.imageUrl && (
                    <div className="pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attached Image Evidence
                      </h3>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-md">
                        <img
                          src={complaint.imageUrl}
                          alt="Attached Issue Evidence"
                          className="w-full h-auto max-h-72 object-cover"
                        />
                      </div>
                      {complaint.imageClassification && (
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          Classification: <strong className="text-slate-700">{complaint.imageClassification}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Feedback display if submitted */}
                  {complaint.rating && (
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>Student Feedback: {complaint.rating} / 5 Stars</span>
                      </div>
                      {complaint.feedback && (
                        <p className="text-xs text-slate-700 italic">"{complaint.feedback}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline progression */}
                <ComplaintTimeline currentStatus={complaint.status} updates={updates} />
              </div>

              {/* Right Column: Admin Management Form (1 col) */}
              <div className="space-y-6">
                {/* Management Form */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Admin Control Panel</h3>
                  </div>

                  <form onSubmit={handleUpdateDetails} className="space-y-4">
                    {/* Status */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Ticket Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Assigned Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => {
                          const newDept = e.target.value;
                          setDepartment(newDept);
                          const availableStaff = departmentStaffMap[newDept] || [];
                          setAssignedStaff(availableStaff[0] || '');
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Administration">Administration</option>
                        <option value="IT Department">IT Department</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Unassigned">Unassigned</option>
                      </select>
                    </div>

                    {/* Assigned Staff */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Responsible Staff Member
                      </label>
                      <select
                        value={assignedStaff}
                        onChange={(e) => setAssignedStaff(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">-- Select Staff --</option>
                        {(departmentStaffMap[department] || []).map((staff) => (
                          <option key={staff} value={staff}>
                            {staff}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resolution Details */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Resolution Details
                      </label>
                      <textarea
                        rows={3}
                        value={resolutionDetails}
                        onChange={(e) => setResolutionDetails(e.target.value)}
                        placeholder="Explain actions taken to resolve the issue (e.g. replaced router, repaired door lock)..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                      />
                    </div>

                    {/* Progress Comment / Note */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Add Progress Note / Comment
                      </label>
                      <textarea
                        rows={2}
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder="e.g. Technician dispatched to site..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Notify Student'}
                      </button>

                      {status !== 'Resolved' && status !== 'Closed' && (
                        <button
                          type="button"
                          onClick={handleResolve}
                          disabled={saving}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

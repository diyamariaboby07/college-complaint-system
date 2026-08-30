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
} from 'lucide-react';
import { complaintAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge/PriorityBadge';
import { ComplaintTimeline } from '../../components/ComplaintTimeline/ComplaintTimeline';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const StudentComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getById(id);
      if (res.data && res.data.data) {
        setComplaint(res.data.data.complaint);
        setUpdates(res.data.data.updates || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Real-time update listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = (updatedComp) => {
      if (updatedComp && (updatedComp._id === complaint?._id || updatedComp.complaintId === complaint?.complaintId)) {
        setComplaint(updatedComp);
        fetchDetails(); // refresh timeline updates
      }
    };

    socket.on('complaint:updated', handleUpdate);
    socket.on('complaint:resolved', handleUpdate);

    return () => {
      socket.off('complaint:updated', handleUpdate);
      socket.off('complaint:resolved', handleUpdate);
    };
  }, [complaint?._id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      const res = await complaintAPI.submitFeedback(complaint._id, {
        rating,
        feedback: feedbackText,
      });
      if (res.data && res.data.data) {
        setComplaint(res.data.data);
        setFeedbackSuccess(true);
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          {/* Top Breadcrumb & Actions */}
          <div className="flex items-center justify-between">
            <Link
              to="/student/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Complaints
            </Link>

            {complaint && (
              <div className="flex items-center gap-2">
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
                to="/student/complaints"
                className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Return to Complaints List
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Complaint Details & Timeline (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Main Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm px-3 py-1 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                      {complaint.complaintId}
                    </span>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg">
                      {complaint.category}
                    </span>
                    {complaint.isEscalated && (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Escalated
                      </span>
                    )}
                  </div>

                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {complaint.title}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted on {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* AI Summary Banner */}
                  {complaint.summary && (
                    <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-brand-900 block mb-0.5">Quick Summary:</span>
                        <p className="text-brand-800 leading-relaxed">{complaint.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Full Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Issue Description
                    </h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Location & Attached Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Campus Location
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>{complaint.location}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Assigned Facility
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{complaint.department || 'Awaiting Routing'}</span>
                      </div>
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

                  {/* Resolution Details Banner if Resolved */}
                  {complaint.status === 'Resolved' && complaint.resolutionDetails && (
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Official Resolution Summary</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        {complaint.resolutionDetails}
                      </p>
                      {complaint.resolvedAt && (
                        <p className="text-[11px] text-emerald-700 font-medium pt-1">
                          Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Timeline Component */}
                <ComplaintTimeline currentStatus={complaint.status} updates={updates} />
              </div>

              {/* Right Column: Staff Assignment & Student Feedback (1 col) */}
              <div className="space-y-6">
                {/* Assignment Info Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Routing & Handling
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Department</span>
                      <span className="font-bold text-slate-800">
                        {complaint.department || 'Unassigned'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Assigned Staff</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                        {complaint.assignedStaff || 'Pending Officer Assignment'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Last Updated</span>
                      <span className="font-medium text-slate-600">
                        {new Date(complaint.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feedback Submission or Display */}
                {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Student Satisfaction Feedback
                      </h3>
                    </div>

                    {complaint.rating ? (
                      /* Display existing feedback */
                      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= complaint.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-slate-800 ml-1.5">
                            {complaint.rating} / 5 Stars
                          </span>
                        </div>
                        {complaint.feedback && (
                          <p className="text-xs text-slate-700 italic">
                            "{complaint.feedback}"
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-medium">Feedback recorded ✓</p>
                      </div>
                    ) : (
                      /* Feedback Submission Form */
                      <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                        <p className="text-xs text-slate-600">
                          How satisfied are you with the resolution of this issue?
                        </p>

                        {/* 5-Star Selector */}
                        <div className="flex items-center gap-1.5 py-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-2">
                            {rating} Star{rating > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Optional notes or feedback for the maintenance team..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          {submittingFeedback ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Submit Resolution Rating'
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

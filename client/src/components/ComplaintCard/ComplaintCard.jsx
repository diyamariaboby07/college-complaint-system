import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Star,
  ArrowRight,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { PriorityBadge } from '../PriorityBadge/PriorityBadge';
import { useAuth } from '../../store/authStore';

export const ComplaintCard = ({ complaint }) => {
  const { isAdmin } = useAuth();
  const detailUrl = isAdmin
    ? `/admin/complaints/${complaint.complaintId || complaint._id}`
    : `/student/complaints/${complaint.complaintId || complaint._id}`;

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between hover:border-brand-300 group">
      <div>
        {/* Top Badges & ID */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
              {complaint.complaintId || 'CMP-###'}
            </span>
            <span className="text-xs font-semibold text-slate-600 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md">
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={complaint.priority} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Escalation banner */}
        {complaint.isEscalated && complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
          <div className="mb-3 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Escalated (Exceeded resolution time threshold)</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
          {complaint.title}
        </h3>

        {/* AI Summary or Description snippet */}
        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
          {complaint.summary || complaint.description}
        </p>

        {/* Location & Meta info */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location}</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            {complaint.imageUrl && (
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Paperclip className="w-3 h-3 text-brand-500" />
                Image Attached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Details / Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Rating preview if resolved */}
        {complaint.rating ? (
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{complaint.rating}/5</span>
            {complaint.feedback && (
              <span className="text-[11px] text-slate-400 font-normal italic truncate max-w-[120px]">
                "{complaint.feedback}"
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            {complaint.department && complaint.department !== 'Unassigned'
              ? `Dept: ${complaint.department}`
              : 'Awaiting Department'}
          </span>
        )}

        <Link
          to={detailUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Check,
  Circle,
  Clock,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Shield,
} from 'lucide-react';

const stages = [
  { id: 'Submitted', label: 'Submitted', icon: Clock },
  { id: 'Under Review', label: 'Under Review', icon: Circle },
  { id: 'Assigned', label: 'Assigned', icon: UserCheck },
  { id: 'In Progress', label: 'In Progress', icon: PlayCircle },
  { id: 'Resolved', label: 'Resolved', icon: CheckCircle2 },
  { id: 'Closed', label: 'Closed', icon: XCircle },
];

export const ComplaintTimeline = ({ currentStatus, updates = [] }) => {
  const currentStageIndex = stages.findIndex((s) => s.id === currentStatus);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="space-y-6">
      {/* 1. Visual Lifecycle Stepper */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Lifecycle Progression
        </h4>

        {/* Desktop / Tablet Stepper */}
        <div className="hidden sm:flex items-center justify-between relative">
          {/* Connecting Track Line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-100 z-0">
            <div
              className="h-full bg-brand-500 transition-all duration-500"
              style={{
                width: `${(activeIndex / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {stages.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-emerald-200'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-brand-200 animate-pulse-subtle'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-semibold tracking-tight whitespace-nowrap ${
                    isCurrent
                      ? 'text-brand-700 font-bold'
                      : isCompleted
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="sm:hidden space-y-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-2 ring-brand-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={`text-xs ${
                    isCurrent
                      ? 'text-brand-700 font-bold'
                      : isCompleted
                      ? 'text-slate-700 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Chronological Updates Log */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Activity & Progress Updates
          </h4>
        </div>

        {updates.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No progress updates recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {updates.map((update, index) => {
              const dateStr = new Date(update.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={update._id || index} className="relative group">
                  {/* Pin Dot */}
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white border-2 border-brand-200 group-hover:scale-110 transition-transform"></span>

                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-brand-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {update.adminId?.name || 'Administrator'}
                        </span>
                        {update.status && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100/70 text-brand-800 font-semibold font-mono">
                            {update.status}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{update.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

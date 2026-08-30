import React from 'react';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, UserCheck, XCircle } from 'lucide-react';

const statusConfig = {
  Submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    dot: 'bg-blue-500',
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
    dot: 'bg-amber-500',
  },
  Assigned: {
    label: 'Assigned',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: UserCheck,
    dot: 'bg-indigo-500',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: PlayCircle,
    dot: 'bg-purple-500',
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
  Closed: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: XCircle,
    dot: 'bg-slate-400',
  },
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.Submitted;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

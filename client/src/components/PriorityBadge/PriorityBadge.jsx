import React from 'react';
import { Flame, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const priorityConfig = {
  Low: {
    label: 'Low',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: ArrowDownRight,
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: ArrowUpRight,
  },
  High: {
    label: 'High',
    bg: 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
    icon: AlertTriangle,
  },
  Critical: {
    label: 'Critical',
    bg: 'bg-rose-100 text-rose-700 border-rose-300 font-bold animate-pulse-subtle shadow-rose-100 shadow-sm',
    icon: Flame,
  },
};

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const config = priorityConfig[priority] || priorityConfig.Low;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

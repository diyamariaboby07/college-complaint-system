import React from 'react';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Timer,
} from 'lucide-react';

export const StatisticsCards = ({ stats, isAdmin = false }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Complaints',
      value: stats.total ?? 0,
      icon: FileText,
      color: 'bg-blue-500 text-white',
      trend: 'Registered tickets',
    },
    {
      title: 'Pending Review',
      value: stats.pending ?? (stats.submitted + (stats.underReview || 0) + (stats.assigned || 0) || 0),
      icon: Clock,
      color: 'bg-amber-500 text-white',
      trend: 'Awaiting action',
    },
    {
      title: 'In Progress',
      value: stats.inProgress ?? 0,
      icon: PlayCircle,
      color: 'bg-purple-500 text-white',
      trend: 'Under maintenance',
    },
    {
      title: 'Resolved',
      value: stats.resolved ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500 text-white',
      trend: 'Fixed & completed',
    },
  ];

  if (isAdmin) {
    cards.push({
      title: 'Critical & Escalated',
      value: (stats.critical || 0) + (stats.escalated || 0),
      icon: AlertTriangle,
      color: 'bg-rose-500 text-white',
      trend: `${stats.escalated || 0} overdue escalations`,
      highlight: true,
    });

    if (stats.resolutionTimes) {
      cards.push({
        title: 'Avg Resolution Time',
        value: stats.resolutionTimes.formattedAverage || `${stats.resolutionTimes.averageHours || 0}h`,
        icon: Timer,
        color: 'bg-indigo-500 text-white',
        trend: `Fastest: ${stats.resolutionTimes.fastestHours || 0}h`,
      });
    }
  }

  return (
    <div className={`grid gap-4 sm:gap-5 ${isAdmin ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4'}`}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
              card.highlight
                ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <span className="text-xs font-semibold text-slate-500 truncate">{card.title}</span>
              <div className={`p-2 rounded-xl shrink-0 ${card.color} shadow-xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

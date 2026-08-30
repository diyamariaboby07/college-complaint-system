import React from 'react';
import { BarChart2, PieChart, Building2, TrendingUp } from 'lucide-react';

export const AnalyticsCharts = ({ departmentStats = [], categoryStats = [], statusStats = [] }) => {
  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count || 0), 1);
  const totalStatusCount = statusStats.reduce((sum, s) => sum + (s.count || 0), 0) || 1;

  const statusColors = {
    Submitted: 'bg-blue-500',
    'Under Review': 'bg-amber-500',
    Assigned: 'bg-indigo-500',
    'In Progress': 'bg-purple-500',
    Resolved: 'bg-emerald-500',
    Closed: 'bg-slate-400',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Department-Wise Performance Table / Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Department Resolution Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Campus facilities</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2">Department</th>
                  <th className="pb-2 text-center">Total</th>
                  <th className="pb-2 text-center">Pending</th>
                  <th className="pb-2 text-center">Resolved</th>
                  <th className="pb-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentStats.map((dept) => {
                  const resolvedRate =
                    dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                  return (
                    <tr key={dept.department} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">{dept.department}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-slate-700">
                        {dept.total}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                          {dept.pending}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          {dept.resolved}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono text-slate-600">{resolvedRate}%</span>
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${resolvedRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Category Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Category</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Issue density</span>
          </div>

          <div className="space-y-3">
            {categoryStats.map((item) => {
              const percentage = Math.round((item.count / maxCategoryCount) * 100);
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.category}</span>
                    <span className="font-mono text-slate-500">{item.count} tickets</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Horizontal Stack */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Status Breakdown
          </h4>
          <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-100">
            {statusStats.map((s) => {
              const widthPct = (s.count / totalStatusCount) * 100;
              if (widthPct === 0) return null;
              return (
                <div
                  key={s.status}
                  className={`h-full ${statusColors[s.status] || 'bg-slate-300'}`}
                  style={{ width: `${widthPct}%` }}
                  title={`${s.status}: ${s.count}`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {statusStats.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className={`w-2 h-2 rounded-full ${statusColors[s.status] || 'bg-slate-300'}`} />
                <span>
                  {s.status} ({s.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

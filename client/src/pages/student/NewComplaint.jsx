import React, { useState } from 'react';
import { Sparkles, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { ComplaintForm } from '../../components/ComplaintForm/ComplaintForm';
import { Navbar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const StudentNewComplaint = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Report a Campus Issue
            </h1>
            <p className="text-xs text-slate-500">
              Submit a detailed complaint for immediate routing to responsible college departments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Form (2 cols) */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
              <ComplaintForm />
            </div>

            {/* Side Information & Tips (1 col) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-5 text-white shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm font-bold">Smart Helpdesk Features</h3>
                </div>
                <p className="text-xs text-brand-100 leading-relaxed">
                  As you type your description, our built-in classifier automatically suggests the appropriate facility department and checks for similar ongoing tickets.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3.5 text-xs text-slate-600">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Submission Guidelines
                </h4>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Specify exact room numbers or block names (e.g. Science Block Lab 2).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Attach a clear photo when reporting physical equipment damage or water leaks.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>Tickets are reviewed within 2–4 hours during campus operational hours.</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

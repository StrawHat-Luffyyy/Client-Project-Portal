import { Shield, Key, Grid, Layout } from 'lucide-react';

export function Trust() {
  return (
    <section id="security" className="bg-slate-50 py-24 sm:py-32 border-t border-slate-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-sm font-bold leading-7 text-blue-600 uppercase tracking-wider">
            Security & Access
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built around clear boundaries.
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Clients and teams see what they need, while organization and role boundaries remain explicit.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Visual Representation */}
          <div className="relative rounded-2xl bg-white border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             {/* Decorative background pattern */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:1rem_1rem] rounded-2xl opacity-50" />
             
             <div className="relative z-10 flex flex-col items-center w-full max-w-md space-y-4">
                {/* Flow Diagram */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                   <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-blue-500" />
                     Client
                   </div>
                   <div className="text-xs text-slate-400">External</div>
                </div>

                <div className="h-6 w-px bg-slate-300" />

                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-center shadow-sm relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                   <span className="text-sm font-bold text-blue-900">Client Workspace</span>
                </div>

                <div className="h-6 w-px bg-slate-300" />

                <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center space-y-4 bg-white/50 backdrop-blur-sm">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-2">Organization Boundary</span>
                   
                   <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between shadow-sm">
                     <div className="text-sm font-semibold text-white flex items-center gap-2">
                       <Shield className="h-4 w-4 text-emerald-400" />
                       Internal Team
                     </div>
                     <div className="text-xs text-slate-400">Internal</div>
                   </div>

                   <div className="h-6 w-px bg-slate-300" />

                   <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-4 flex items-center justify-center shadow-sm">
                     <span className="text-sm font-bold text-slate-700">Protected Data Access</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Mechanisms List */}
          <div className="flex flex-col gap-10">
             <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-base font-semibold text-slate-900 mb-1">Organization isolation</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">
                     Every organization's data is isolated. Workspaces cannot view or access data outside of their explicitly defined organizational boundaries.
                   </p>
                </div>
             </div>
             
             <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-base font-semibold text-slate-900 mb-1">Role-based access</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">
                     Granular permissions ensure clients only see what you intend for them to see, while your internal team retains full administrative control.
                   </p>
                </div>
             </div>

             <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Grid className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-base font-semibold text-slate-900 mb-1">Client workspace separation</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">
                     Clients access dedicated portals. They never see internal engineering chatter, draft tasks, or other clients' sensitive information.
                   </p>
                </div>
             </div>

             <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Layout className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-base font-semibold text-slate-900 mb-1">Structured visibility</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">
                     The platform automatically surfaces sanitized, high-level progress summaries based on actual engineering work, maintaining transparency safely.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

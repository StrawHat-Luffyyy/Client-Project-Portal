import {
  FileEdit,
  ClipboardList,
  Users,
  Activity,
  CheckCircle,
} from 'lucide-react';

export function Workflow() {
  return (
    <section
      id="workflow"
      className="border-t border-slate-200 bg-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center mb-16">
          <h2 className="text-sm font-semibold leading-7 text-blue-600 uppercase tracking-wide">
            How it works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A unified process from start to finish
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Stop losing project context across different tools. Move work
            through a structured, transparent workflow.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="absolute left-8 top-12 bottom-12 hidden w-px bg-slate-200 md:block"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 relative z-10">
                  <span className="text-xl font-bold text-blue-600">01</span>
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Client submits request
                    </h3>
                    <p className="text-slate-600">
                      Clients use a structured intake form tailored to your
                      organization, ensuring you get all necessary details
                      upfront.
                    </p>
                  </div>
                  <div className="w-full sm:w-64 shrink-0 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                      <FileEdit className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        New Project Request
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-slate-100"></div>
                      <div className="h-2 w-3/4 rounded bg-slate-100"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 relative z-10">
                  <span className="text-xl font-bold text-blue-600">02</span>
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Team organizes requirements
                    </h3>
                    <p className="text-slate-600">
                      Project managers refine the request into actionable
                      requirements, milestones, and assigned tasks.
                    </p>
                  </div>
                  <div className="w-full sm:w-64 shrink-0 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                      <ClipboardList className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        Requirements
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border border-slate-300"></div>
                        <div className="h-2 w-24 rounded bg-slate-200"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border border-slate-300"></div>
                        <div className="h-2 w-32 rounded bg-slate-200"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border border-slate-300"></div>
                        <div className="h-2 w-20 rounded bg-slate-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 relative z-10">
                  <span className="text-xl font-bold text-blue-600">03</span>
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Work gets assigned
                    </h3>
                    <p className="text-slate-600">
                      Engineers and designers pick up tasks in a focused
                      environment, separated from client noise.
                    </p>
                  </div>
                  <div className="w-full sm:w-64 shrink-0 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        Team Board
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded bg-slate-100 p-2 h-16">
                        <div className="h-1.5 w-1/2 rounded bg-slate-300 mb-2"></div>
                        <div className="h-4 w-full rounded bg-white shadow-sm"></div>
                      </div>
                      <div className="flex-1 rounded bg-blue-50 border border-blue-100 p-2 h-16">
                        <div className="h-1.5 w-1/2 rounded bg-blue-300 mb-2"></div>
                        <div className="h-4 w-full rounded bg-white shadow-sm border border-blue-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col md:flex-row gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 relative z-10">
                  <span className="text-xl font-bold text-blue-600">04</span>
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Client tracks progress
                    </h3>
                    <p className="text-slate-600">
                      Clients see high-level milestones and sanitized activity
                      updates, reducing status update meetings.
                    </p>
                  </div>
                  <div className="w-full sm:w-64 shrink-0 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700">
                        Client View
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mb-3">
                      <div className="h-full bg-emerald-500 rounded-full w-2/3"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600">
                        Progress
                      </span>
                      <span className="font-bold text-emerald-600">66%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative flex flex-col md:flex-row gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-sm border border-blue-500 relative z-10">
                  <span className="text-xl font-bold text-white">05</span>
                </div>
                <div className="flex-1 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Delivery gets approved
                    </h3>
                    <p className="text-slate-600">
                      Deliver finalized work, collect structured feedback, and
                      mark the project as officially completed.
                    </p>
                  </div>
                  <div className="w-full sm:w-64 shrink-0 rounded-xl bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-center flex-col py-6">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      Project Delivered
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

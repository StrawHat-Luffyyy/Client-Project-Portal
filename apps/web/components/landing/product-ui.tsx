import {
  Layout,
  CheckSquare,
  MessageSquare,
  Clock,
  Search,
  CheckCircle2,
} from 'lucide-react';

export function ProductUI() {
  return (
    <section
      id="product"
      className="bg-slate-50 py-24 sm:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A workspace built for delivery
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Everything your team needs to execute, and everything your client
            needs to feel confident.
          </p>
        </div>

        {/* Large Dashboard UI */}
        <div className="relative mx-auto w-full max-w-6xl rounded-2xl border border-slate-200/60 bg-white shadow-2xl overflow-hidden ring-1 ring-slate-200/50">
          <div className="flex h-screen max-h-[700px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 bg-slate-50 hidden md:flex flex-col">
              <div className="h-14 border-b border-slate-200 flex items-center px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
                    <Layout className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    Acme Agency
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                  <div className="h-8 w-full rounded-md border border-slate-200 bg-white shadow-sm pl-9 pr-3 py-1.5 text-xs text-slate-500 flex items-center">
                    Search projects...
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Active Projects
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-md bg-blue-50 text-blue-700 cursor-pointer">
                    <span className="text-sm font-medium truncate pr-2">
                      Acme Website Redesign
                    </span>
                    <span className="text-xs font-bold">72%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors">
                    <span className="text-sm font-medium truncate pr-2">
                      Mobile App Revamp
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      48%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors">
                    <span className="text-sm font-medium truncate pr-2">
                      Analytics Platform
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      91%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Header */}
              <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-bold text-slate-900">
                    Acme Website Redesign
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200"></div>
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-200"></div>
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-200"></div>
                  </div>
                  <button className="h-8 rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 transition-colors">
                    Share
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 px-6">
                <nav className="-mb-px flex space-x-6 text-sm font-medium">
                  <span className="border-b-2 border-blue-500 py-4 text-blue-600">
                    Overview
                  </span>
                  <span className="border-b-2 border-transparent py-4 text-slate-500 hover:text-slate-700">
                    Tasks
                  </span>
                  <span className="border-b-2 border-transparent py-4 text-slate-500 hover:text-slate-700">
                    Requirements
                  </span>
                  <span className="border-b-2 border-transparent py-4 text-slate-500 hover:text-slate-700">
                    Files
                  </span>
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Current Sprint / Tasks */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-slate-400" />{' '}
                          Current Tasks
                        </h3>
                        <span className="text-xs font-medium text-slate-500">
                          3 remaining
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors">
                          <div className="mt-1 h-4 w-4 rounded border border-slate-300"></div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-900">
                              Implement dashboard charts
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                              Use Recharts to build the analytics overview
                              component for the admin panel.
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              Frontend
                            </span>
                            <div className="h-6 w-6 rounded-full bg-blue-100 border border-white shadow-sm"></div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors">
                          <div className="mt-1 flex h-4 w-4 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-white">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-500 line-through">
                              Setup PostgreSQL schema
                            </h4>
                            <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                              Create migrations for users, projects, and tasks
                              tables.
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 line-through">
                              Backend
                            </span>
                            <div className="h-6 w-6 rounded-full bg-emerald-100 border border-white shadow-sm opacity-60"></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          Add task...
                        </button>
                      </div>
                    </div>

                    {/* Client Comments */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-400" />{' '}
                          Client Feedback
                        </h3>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex gap-4">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 shrink-0"></div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-900">
                                Sarah (Client)
                              </span>
                              <span className="text-xs text-slate-500">
                                2 hours ago
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100">
                              The new dashboard looks great! Can we make the
                              primary action button slightly larger on mobile?
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                          <div className="h-8 w-8 rounded-full bg-blue-600 shrink-0"></div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2 mb-1">
                              <span className="text-xs text-slate-500">
                                1 hour ago
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                You
                              </span>
                            </div>
                            <p className="text-sm text-white bg-blue-600 p-3 rounded-lg rounded-tr-none text-left inline-block">
                              Absolutely. We've adjusted the padding. It's live
                              on the staging link now.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Status Card */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Project Status
                      </h3>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          Overall Progress
                        </span>
                        <span className="font-bold text-slate-900">72%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-blue-600 rounded-full w-[72%]"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Next Milestone
                          </span>
                          <span className="font-medium text-slate-900">
                            Oct 12
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Tasks Done
                          </span>
                          <span className="font-medium text-slate-900">
                            24 / 32
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Recent Activity
                      </h3>
                      <div className="relative border-l border-slate-200 ml-2 space-y-5 pb-1">
                        <div className="relative pl-4">
                          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                          <p className="text-xs font-medium text-slate-900">
                            Requirement approved
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            By Sarah • Yesterday
                          </p>
                        </div>
                        <div className="relative pl-4">
                          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500"></span>
                          <p className="text-xs font-medium text-slate-900">
                            Task moved to Review
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            By Mike • Yesterday
                          </p>
                        </div>
                        <div className="relative pl-4">
                          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300"></span>
                          <p className="text-xs font-medium text-slate-900">
                            Project created
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Sep 10, 2026
                          </p>
                        </div>
                      </div>
                    </div>
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

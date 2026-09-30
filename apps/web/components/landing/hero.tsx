import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock,
  Layout,
  Check,
  MessageSquare,
} from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl mb-6 text-balance">
            From request to delivery.{' '}
            <span className="text-blue-600 block mt-2">
              Everything your project needs, in one place.
            </span>
          </h1>
          <p className="text-lg leading-8 text-slate-600 mb-10 text-balance mx-auto max-w-2xl">
            A unified, secure workspace where clients and teams can manage
            requirements, project work, feedback, and final delivery without
            scattered emails and spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-md bg-blue-600 px-8 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Create workspace
            </Link>
            <Link
              href="#product"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-md border border-slate-200 bg-white px-8 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
            >
              View demo
            </Link>
          </div>
        </div>

        {/* Realistic Product UI Preview */}
        <div className="mt-20 relative mx-auto w-full max-w-5xl rounded-xl border border-slate-200/60 bg-white shadow-2xl overflow-hidden ring-1 ring-slate-200/50">
          {/* Mac-style window controls */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-slate-300"></div>
              <div className="h-3 w-3 rounded-full bg-slate-300"></div>
              <div className="h-3 w-3 rounded-full bg-slate-300"></div>
            </div>
            <div className="flex-1 text-center">
              <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-white border border-slate-200 text-xs text-slate-400 font-medium shadow-sm">
                <Layout className="h-3 w-3 mr-1.5" /> app.clientportal.com
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row bg-slate-50/30">
            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-10 border-r border-slate-100 bg-white">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      In progress
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      Project ID: #1042
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Acme Website Redesign
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">72%</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    Completed
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-10">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[72%]"></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
                  Project Milestones
                  <button className="text-blue-600 text-xs font-medium hover:underline">
                    View all
                  </button>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 line-through">
                        Requirements approved
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Sep 15</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 line-through">
                        Design completed
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Sep 28</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50/50 shadow-sm ring-1 ring-inset ring-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20"></span>
                        <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-r-transparent animate-spin"></div>
                      </div>
                      <span className="text-sm font-semibold text-blue-900">
                        Development in progress
                      </span>
                    </div>
                    <span className="text-xs font-medium text-blue-700">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <Circle className="h-5 w-5 text-slate-300" />
                      <span className="text-sm font-medium text-slate-500">
                        Client review
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <Circle className="h-5 w-5 text-slate-300" />
                      <span className="text-sm font-medium text-slate-500">
                        Final delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Data */}
            <div className="w-full md:w-80 p-6 bg-slate-50">
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Upcoming Deadlines
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Client review
                      </p>
                      <p className="text-xs text-amber-600 font-medium">
                        Tomorrow
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                      <Clock className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Final delivery
                      </p>
                      <p className="text-xs text-slate-500">Oct 8, 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Recent Activity
                </h3>
                <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
                  <div className="relative pl-5">
                    <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500"></span>
                    <p className="text-sm font-medium text-slate-900">
                      Dashboard development started
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                  </div>
                  <div className="relative pl-5">
                    <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                    <p className="text-sm font-medium text-slate-900">
                      API integration completed
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Yesterday</p>
                  </div>
                  <div className="relative pl-5">
                    <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center">
                      <MessageSquare className="h-2 w-2 text-indigo-600" />
                    </span>
                    <p className="text-sm font-medium text-slate-900">
                      New feedback added
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      by Sarah (Client) • Yesterday
                    </p>
                  </div>
                  <div className="relative pl-5">
                    <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                    </span>
                    <p className="text-sm font-medium text-slate-900">
                      Client approved homepage design
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Sep 28</p>
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

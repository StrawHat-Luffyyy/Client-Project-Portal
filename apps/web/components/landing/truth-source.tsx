'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  CheckSquare,
  Activity,
  MessageSquare,
  CheckCircle,
  Rocket,
  ArrowRight,
  User,
  Paperclip,
  Check,
  Calendar,
  Layers,
  CheckCircle2,
  Box,
  Link,
} from 'lucide-react';

const workflowSteps = [
  {
    id: 'requirements',
    title: 'Requirements',
    description: 'Client submits detailed requests and attachments.',
    icon: FileText,
    previewTitle: 'Homepage Redesign',
    previewBadge: 'High Priority',
    previewBadgeColor: 'amber',
    renderContent: () => (
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">
            We need to completely overhaul the marketing site to better align
            with our new enterprise positioning. The current site feels too
            consumer-focused. Focus on creating trust and showcasing platform capabilities.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
              <Paperclip className="h-3 w-3" />
              brand_v2.pdf
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
              <Paperclip className="h-3 w-3" />
              competitor.key
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 ml-auto">
              <User className="h-3 w-3" />
              Sarah (Client)
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 mt-6">
          <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 mt-1">
            <span className="text-xs font-bold text-blue-700">PM</span>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-3 border border-blue-100 shadow-sm flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">Requirements confirmed</p>
            <p className="text-xs text-blue-800">
              Understood. I will begin breaking these down into engineering tasks and design sprints.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'planning',
    title: 'Planning',
    description: 'PM breaks down work into assignable tasks.',
    icon: CheckSquare,
    previewTitle: 'Implementation Plan',
    previewBadge: '3 tasks',
    previewBadgeColor: 'blue',
    renderContent: () => (
      <div className="space-y-3">
        {[
          { t: 'Homepage redesign', assignee: 'JD', status: 'IN PROGRESS', color: 'bg-blue-100 text-blue-700' },
          {
            t: 'Responsive implementation',
            assignee: 'SW',
            status: 'IN PROGRESS',
            color: 'bg-blue-100 text-blue-700'
          },
          { t: 'CMS integration', assignee: 'MK', status: 'TODO', color: 'bg-slate-100 text-slate-600' },
          { t: 'Analytics setup', assignee: 'MK', status: 'TODO', color: 'bg-slate-100 text-slate-600' },
        ].map((task, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`h-5 w-5 rounded border shrink-0 ${task.status === 'TODO' ? 'border-slate-300 bg-white' : 'border-blue-500 bg-blue-50'}`} />
              <span className="text-sm font-medium text-slate-700 line-clamp-1">
                {task.t}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`hidden sm:inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${task.color}`}>
                {task.status}
              </span>
              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm ring-1 ring-slate-200">
                {task.assignee}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Engineers execute while clients track high-level completion.',
    icon: Activity,
    previewTitle: 'Project Progress',
    previewBadge: 'In Progress',
    previewBadgeColor: 'blue',
    renderContent: () => (
      <>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500 mt-1">Sprint 4 • Oct 1 - Oct 14</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">72%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6 ring-1 ring-inset ring-slate-200">
          <div className="h-full bg-blue-600 rounded-full w-[72%]" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Completed</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-bold text-slate-900">18</p>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">tasks</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">In Progress</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">5</p>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">tasks</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 shadow-sm">
          <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Upcoming Milestone
            </p>
            <p className="text-xs text-blue-800 mt-1.5 leading-relaxed">
              Client review scheduled for Friday. Engineering is on track to complete the CMS schema updates by tomorrow.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'In-context discussion on deliverables.',
    icon: MessageSquare,
    previewTitle: 'Client Feedback',
    previewBadge: 'Awaiting client review',
    previewBadgeColor: 'slate',
    renderContent: () => (
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-700">CL</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 truncate pr-2">Sarah (Client)</span>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">2 hours ago</span>
            </div>
            <div className="rounded-lg rounded-tl-none bg-white p-3 text-sm text-slate-700 border border-slate-200 shadow-sm leading-relaxed">
              Can we move the pricing section above testimonials?
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-row-reverse">
          <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
            <span className="text-[10px] font-bold text-blue-700">PM</span>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end mb-1">
              <span className="text-[10px] font-medium text-slate-400 shrink-0 mr-2">10 mins ago</span>
              <span className="text-xs font-bold text-slate-900 truncate">Product Manager</span>
            </div>
            <div className="rounded-lg rounded-tr-none bg-blue-50 p-3 text-sm text-blue-900 border border-blue-100 shadow-sm leading-relaxed inline-block text-left w-full max-w-[90%]">
              Updated the proposed layout. Ready for review.
              <div className="mt-3 flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-blue-100 w-fit">
                 <Link className="h-3 w-3 text-blue-500" />
                 <span className="text-[10px] font-medium text-blue-700">Task #142 attached</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'approval',
    title: 'Approval',
    description: 'Sign-off on completed milestones.',
    icon: CheckCircle,
    previewTitle: 'Approval Request',
    previewBadge: 'Approved',
    previewBadgeColor: 'emerald',
    renderContent: () => (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-start p-4 sm:p-6 text-center shadow-sm">
        <div className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm ring-4 ring-emerald-50">
          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
          Milestone Approved
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mb-6">
          Homepage redesign requirements and initial mockups have been approved. Engineering can proceed.
        </p>
        
        <div className="w-full bg-white border border-emerald-100 rounded-lg p-3 sm:p-4 text-left shadow-sm mb-6">
          <h5 className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Approved Items</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Hero section layout</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Responsive breakpoints</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Pricing component order</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-200 text-[10px] sm:text-xs font-medium text-slate-700 shadow-sm w-full sm:w-auto justify-center">
          <User className="h-3 w-3 text-slate-500 shrink-0" />
          <span className="truncate">Approved by Sarah (Client)</span>
          <span className="text-slate-300 mx-1">|</span>
          <span className="text-slate-500 font-mono shrink-0">Oct 4, 10:23 AM</span>
        </div>
      </div>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Final assets and project handover.',
    icon: Rocket,
    previewTitle: 'Project Handover',
    previewBadge: 'Ready for final review',
    previewBadgeColor: 'fuchsia',
    renderContent: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-start">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Rocket className="h-24 w-24 sm:h-32 sm:w-32 text-slate-900" />
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-widest text-slate-700 border border-slate-200 mb-4 w-fit uppercase">
            <Check className="h-3 w-3" /> Delivery Ready
          </div>
          
          <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            100% Complete
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-sm">
            All approved requirements have been completed. The redesign has been deployed to the production environment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm mb-3">
                <Layers className="h-4 w-4 text-blue-500" /> Deliverables
              </div>
              <ul className="space-y-2 text-[10px] sm:text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Homepage</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Mobile layout</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Production build</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm mb-3">
                <Box className="h-4 w-4 text-fuchsia-500" /> Status
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Deployment</p>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Completed
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Client</p>
                  <span className="text-xs font-semibold text-slate-700">
                    Ready for final review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function TruthSource() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      // Only advance if it's been at least 4 seconds since the last manual interaction
      if (Date.now() - lastInteractionTime >= 4000) {
        setActiveStep((current) => (current + 1) % workflowSteps.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, lastInteractionTime]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setLastInteractionTime(Date.now());
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStepClick(index);
    }
  };

  return (
    <section className="bg-white py-16 sm:py-24 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-sm font-bold leading-7 text-blue-600 uppercase tracking-wider">
            One Workspace
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Every project has a clear next step.
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Requirements, tasks, feedback, and approvals stay connected from
            kickoff to delivery. No more hunting for the latest status.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: WORKFLOW NAV */}
          <div
            className="lg:col-span-5 flex flex-col gap-2 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="tablist"
            aria-label="Workflow Steps"
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-4">
              Project Workflow
            </h3>
            
            {/* Animated active background indicator for the entire row (optional refinement) */}
            <div 
              className="absolute left-0 right-0 h-[72px] sm:h-[80px] bg-slate-50 rounded-xl border border-slate-200/50 shadow-sm transition-all duration-300 ease-in-out z-0 hidden sm:block"
              style={{
                transform: `translateY(calc(${activeStep} * 100% + ${activeStep * 8}px + 24px))`,
              }}
              aria-hidden="true"
            />

            {workflowSteps.map((step, index) => {
              const isActive = activeStep === index;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`preview-panel-${step.id}`}
                  id={`tab-${step.id}`}
                  onClick={() => handleStepClick(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`relative z-10 flex items-center text-left p-3 sm:p-4 rounded-xl transition-all duration-300 w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'sm:bg-transparent bg-slate-50' // On mobile, just use standard bg
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* Left Active Edge Indicator */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ${
                      isActive ? 'bg-blue-600 h-8 opacity-100' : 'bg-blue-600 h-0 opacity-0'
                    }`}
                  />

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
                      isActive
                        ? 'bg-white border-blue-200 text-blue-600 shadow-sm'
                        : 'bg-slate-100/50 border-slate-200 text-slate-400 group-hover:text-slate-600 group-hover:bg-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-auto min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold truncate transition-colors duration-300 ${
                          isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'
                        }`}
                      >
                        <span className="text-slate-400 font-mono text-xs mr-2">
                          0{index + 1}
                        </span>
                        {step.title}
                      </p>
                      <ArrowRight
                        className={`shrink-0 h-4 w-4 transition-all duration-300 ${
                          isActive
                            ? 'text-blue-600 opacity-100 translate-x-0'
                            : 'text-slate-300 opacity-0 -translate-x-2'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: PRODUCT UI PREVIEW */}
          <div
            className="lg:col-span-7 w-full max-w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-xl ring-1 ring-slate-900/5">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[520px] w-full">
                {/* Mock Browser/App Header */}
                <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between h-[52px]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    </div>
                    <div className="ml-4 px-2 py-1 bg-white rounded-md border border-slate-200 text-xs font-medium text-slate-500 shadow-sm flex items-center gap-2 truncate max-w-[200px] sm:max-w-none">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="truncate">Acme Website Redesign</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400 shrink-0 ml-2 tabular-nums">
                    Step 0{activeStep + 1} / 06
                  </div>
                </div>

                {/* Mock App Content Area */}
                <div className="relative flex-auto w-full h-full overflow-hidden bg-slate-50/30">
                  {workflowSteps.map((step, index) => {
                    const isActive = activeStep === index;
                    const isPast = index < activeStep;
                    
                    return (
                      <div
                        key={step.id}
                        id={`preview-panel-${step.id}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${step.id}`}
                        className={`absolute inset-0 p-4 sm:p-6 overflow-y-auto transition-all duration-400 ease-out flex flex-col ${
                          isActive
                            ? 'opacity-100 translate-y-0 z-10'
                            : isPast
                            ? 'opacity-0 -translate-y-4 pointer-events-none z-0'
                            : 'opacity-0 translate-y-4 pointer-events-none z-0'
                        }`}
                      >
                        {/* Common Inner Header for all steps */}
                        <div className="flex items-center justify-between mb-6 shrink-0">
                          <h4 className="text-lg font-bold text-slate-900">
                            {step.previewTitle}
                          </h4>
                          <span 
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              step.previewBadgeColor === 'emerald'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                : step.previewBadgeColor === 'blue'
                                ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                : step.previewBadgeColor === 'slate'
                                ? 'bg-slate-50 text-slate-700 ring-slate-600/20'
                                : step.previewBadgeColor === 'fuchsia'
                                ? 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20'
                                : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                            }`}
                          >
                            {step.previewBadge}
                          </span>
                        </div>
                        
                        {/* Dynamic Step Content */}
                        <div className="flex-1 w-full">
                          {step.renderContent()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

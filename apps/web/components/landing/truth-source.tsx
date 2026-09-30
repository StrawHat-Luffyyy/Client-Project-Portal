'use client';

import { useState, useEffect, useRef } from 'react';
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
  },
  {
    id: 'planning',
    title: 'Planning',
    description: 'PM breaks down work into assignable tasks.',
    icon: CheckSquare,
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Engineers execute while clients track high-level completion.',
    icon: Activity,
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'In-context discussion on deliverables.',
    icon: MessageSquare,
  },
  {
    id: 'approval',
    title: 'Approval',
    description: 'Sign-off on completed milestones.',
    icon: CheckCircle,
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Final assets and project handover.',
    icon: Rocket,
  },
];

export function TruthSource() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isHovered) return;

    const interval = setInterval(() => {
      setActiveStep((current) => (current + 1) % workflowSteps.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isVisible, isHovered]);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-24 sm:py-32 border-t border-slate-200 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={`mx-auto max-w-2xl lg:mx-0 transition-all duration-700 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
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
            className={`lg:col-span-5 flex flex-col gap-2 transition-all duration-700 delay-200 transform ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-8'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-4">
              Project Workflow
            </h3>
            {workflowSteps.map((step, index) => {
              const isActive = activeStep === index;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`relative flex items-center text-left p-3 sm:p-4 rounded-xl transition-all duration-300 w-full group ${
                    isActive
                      ? 'bg-slate-50 shadow-sm ring-1 ring-slate-200/50'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* Progress Indicator line */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ${
                      isActive ? 'bg-blue-600 h-8' : 'bg-transparent h-0'
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
                          isActive ? 'text-slate-900' : 'text-slate-600'
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
            className={`lg:col-span-7 transition-all duration-1000 delay-300 transform w-full max-w-full overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-y-0 translate-x-0'
                : 'opacity-0 translate-y-12 lg:translate-y-0 lg:translate-x-12'
            }`}
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
                    <div className="ml-4 px-2 py-1 bg-white rounded-md border border-slate-200 text-xs font-medium text-slate-500 shadow-sm flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="truncate">Acme Website Redesign</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400 shrink-0 ml-2">
                    Step 0{activeStep + 1} / 06
                  </div>
                </div>

                {/* Mock App Content Area */}
                <div className="relative flex-auto w-full h-full overflow-hidden bg-slate-50/30">
                  <ProductUIPreview activeStep={activeStep} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductUIPreview({ activeStep }: { activeStep: number }) {
  return (
    <>
      {/* 01: Requirements */}
      <div
        className={`absolute inset-0 p-6 transition-all duration-400 ${
          activeStep === 0
            ? 'opacity-100 translate-y-0 z-10'
            : 'opacity-0 translate-y-4 pointer-events-none z-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900">
            Homepage Redesign
          </h4>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            High Priority
          </span>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed">
              We need to completely overhaul the marketing site to better align
              with our new enterprise positioning. The current site feels too
              consumer-focused. Focus on creating trust and showcasing platform capabilities.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Paperclip className="h-3 w-3" />
                brand_guidelines_v2.pdf
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Paperclip className="h-3 w-3" />
                competitor_analysis.key
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
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
      </div>

      {/* 02: Planning */}
      <div
        className={`absolute inset-0 p-6 transition-all duration-400 ${
          activeStep === 1
            ? 'opacity-100 translate-y-0 z-10'
            : 'opacity-0 translate-y-4 pointer-events-none z-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Work Breakdown
          </h4>
          <span className="text-xs font-medium text-slate-500">3 tasks</span>
        </div>
        <div className="space-y-3">
          {[
            { t: 'Wireframe hero section', assignee: 'JD', status: 'IN PROGRESS', color: 'bg-blue-100 text-blue-700' },
            {
              t: 'Draft new value propositions',
              assignee: 'SW',
              status: 'IN PROGRESS',
              color: 'bg-blue-100 text-blue-700'
            },
            { t: 'Update CMS schema', assignee: 'MK', status: 'TODO', color: 'bg-slate-100 text-slate-600' },
          ].map((task, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded border ${task.status === 'TODO' ? 'border-slate-300 bg-white' : 'border-blue-500 bg-blue-50'}`} />
                <span className="text-sm font-medium text-slate-700">
                  {task.t}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${task.color}`}>
                  {task.status}
                </span>
                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm ring-1 ring-slate-200">
                  {task.assignee}
                </div>
              </div>
            </div>
          ))}
          <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer mt-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
              <span className="text-lg leading-none">+</span> Add task
            </span>
          </div>
        </div>
      </div>

      {/* 03: Progress */}
      <div
        className={`absolute inset-0 p-6 transition-all duration-400 ${
          activeStep === 2
            ? 'opacity-100 translate-y-0 z-10'
            : 'opacity-0 translate-y-4 pointer-events-none z-0'
        }`}
      >
        <div className="flex items-end justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Project Status
            </h4>
            <p className="text-xs text-slate-500 mt-1">Sprint 4 • Oct 1 - Oct 14</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">72%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6 ring-1 ring-inset ring-slate-200">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out w-[72%]" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Completed</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900">18</p>
              <p className="text-xs text-slate-400 font-medium">tasks</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">In Progress</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600">7</p>
              <p className="text-xs text-slate-400 font-medium">tasks</p>
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
              Design review scheduled for Friday. Engineering is on track to complete the CMS schema updates by tomorrow.
            </p>
          </div>
        </div>
      </div>

      {/* 04: Feedback */}
      <div
        className={`absolute inset-0 p-6 transition-all duration-400 ${
          activeStep === 3
            ? 'opacity-100 translate-y-0 z-10'
            : 'opacity-0 translate-y-4 pointer-events-none z-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Discussion
          </h4>
          <div className="text-xs text-slate-400">2 participants</div>
        </div>
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700">CL</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Sarah (Client)</span>
                <span className="text-[10px] font-medium text-slate-400">2 hours ago</span>
              </div>
              <div className="rounded-lg rounded-tl-none bg-white p-3 text-sm text-slate-700 border border-slate-200 shadow-sm leading-relaxed">
                The new hero section looks fantastic. Can we move the pricing
                section slightly higher up, perhaps right below the
                testimonials?
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
              <span className="text-[10px] font-bold text-blue-700">PM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Product Manager</span>
                <span className="text-[10px] font-medium text-slate-400">10 mins ago</span>
              </div>
              <div className="rounded-lg rounded-tl-none bg-blue-50 p-3 text-sm text-blue-900 border border-blue-100 shadow-sm leading-relaxed">
                Absolutely. I've updated the task for the engineering team.
                They'll adjust the component order in the next deployment.
                <div className="mt-3 flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-blue-100 w-fit">
                   <Link className="h-3 w-3 text-blue-500" />
                   <span className="text-[10px] font-medium text-blue-700">Task #142 attached</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 05: Approval */}
      <div
        className={`absolute inset-0 p-6 transition-all duration-400 flex flex-col ${
          activeStep === 4
            ? 'opacity-100 translate-y-0 z-10'
            : 'opacity-0 translate-y-4 pointer-events-none z-0'
        }`}
      >
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 flex-1 flex flex-col items-center justify-center p-6 text-center shadow-sm">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm ring-4 ring-emerald-50">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            Milestone Approved
          </h4>
          <p className="text-sm text-slate-600 max-w-sm mb-6">
            Homepage redesign requirements and initial mockups have been approved. Engineering can proceed.
          </p>
          
          <div className="w-full bg-white border border-emerald-100 rounded-lg p-4 text-left shadow-sm mb-6">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Approved Items</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">Hero section layout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">Responsive breakpoints</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">Pricing component order</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-sm">
            <User className="h-3 w-3 text-slate-500" />
            Sarah (Client)
            <span className="text-slate-300 mx-1">|</span>
            <span className="text-slate-500 font-mono">Oct 4, 10:23 AM</span>
          </div>
        </div>
      </div>

      {/* 06: Delivery */}
      <div
        className={`absolute inset-0 p-6 transition-all duration-400 flex flex-col ${
          activeStep === 5
            ? 'opacity-100 translate-y-0 z-10'
            : 'opacity-0 translate-y-4 pointer-events-none z-0'
        }`}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden flex-1 flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Rocket className="h-32 w-32 text-slate-900" />
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-widest text-slate-700 border border-slate-200 mb-4 w-fit uppercase">
              <Check className="h-3 w-3" /> Delivery Ready
            </div>
            
            <h4 className="text-2xl font-bold text-slate-900 mb-2">
              Website Ready
            </h4>
            <p className="text-sm text-slate-600 mb-8 max-w-sm">
              All approved requirements have been completed. The redesign has been deployed to the production environment.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-3">
                  <Layers className="h-4 w-4 text-blue-500" /> Deliverables
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Homepage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Mobile layout</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> CMS schema</li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-3">
                  <Box className="h-4 w-4 text-fuchsia-500" /> Status
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Progress</p>
                    <p className="text-lg font-bold text-emerald-600">100%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Deployment</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

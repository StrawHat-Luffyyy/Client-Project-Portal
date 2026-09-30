import {
  ArrowDown,
  FileText,
  CheckSquare,
  Activity,
  MessageSquare,
  CheckCircle,
  Rocket,
} from 'lucide-react';

export function TruthSource() {
  const steps = [
    {
      icon: FileText,
      label: 'Requirements',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      icon: CheckSquare,
      label: 'Tasks',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
    {
      icon: Activity,
      label: 'Progress',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
    {
      icon: MessageSquare,
      label: 'Feedback',
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-200',
    },
    {
      icon: CheckCircle,
      label: 'Approval',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      icon: Rocket,
      label: 'Delivery',
      color: 'text-slate-900',
      bg: 'bg-slate-100',
      border: 'border-slate-300',
    },
  ];

  return (
    <section className="bg-white py-24 sm:py-32 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600 uppercase tracking-wide">
            Single Source of Truth
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            End the scattered communication
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Clients and internal teams no longer need to manage project
            information across scattered emails, disjointed chats, messy
            spreadsheets, and lost documents.
          </p>
        </div>

        <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between relative px-4">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

          {steps.map((step, index) => (
            <div
              key={step.label}
              className="flex flex-col items-center relative z-10 my-4 md:my-0"
            >
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center border ${step.border} ${step.bg} shadow-sm mb-4 transition-transform hover:scale-110 duration-300`}
              >
                <step.icon className={`h-7 w-7 ${step.color}`} />
              </div>
              <span className="text-sm font-bold text-slate-700">
                {step.label}
              </span>

              {/* Mobile connecting arrow */}
              {index < steps.length - 1 && (
                <ArrowDown className="h-6 w-6 text-slate-300 my-4 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

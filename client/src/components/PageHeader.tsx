import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, subtitle, action, eyebrow = "Operations Hub" }: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <span className="sr-only">{eyebrow}</span> : null}
        <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">{subtitle}</p>
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

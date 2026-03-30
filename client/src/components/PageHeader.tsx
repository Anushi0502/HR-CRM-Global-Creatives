import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  eyebrow?: string;
  badge?: string;
  badgeIcon?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow = "Operations Hub",
  badge,
  badgeIcon,
}: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <span className="sr-only">{eyebrow}</span> : null}
        {badge ? (
          <span className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.28em] text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
            {badgeIcon ? <span className="text-slate-600">{badgeIcon}</span> : null}
            {badge}
          </span>
        ) : null}
        <h1 className="text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">{subtitle}</p>
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

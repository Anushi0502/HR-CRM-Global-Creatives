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
    <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-[0.6rem] font-black uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p> : null}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-none">{title}</h1>
        <p className="mt-2 text-sm font-bold text-slate-500 max-w-2xl leading-relaxed">{subtitle}</p>
        {badge ? (
          <div className="mt-3 flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-widest text-slate-700 shadow-sm">
              {badgeIcon ? <span className="text-slate-400">{badgeIcon}</span> : null}
              {badge}
            </span>
          </div>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2 shrink-0">{action}</div> : null}
    </header>
  );
}

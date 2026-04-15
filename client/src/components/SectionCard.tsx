import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
  showAccent?: boolean;
}

export function SectionCard({ title, subtitle, children, rightSlot, showAccent = true }: SectionCardProps) {
  return (
    <section className="surface-card relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {showAccent ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-brand-600" />
      ) : null}
      {title ? (
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black tracking-tight text-slate-900 leading-tight truncate">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs font-bold text-slate-400 max-w-xl leading-relaxed">{subtitle}</p> : null}
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </header>
      ) : null}
      <div className="relative">{children}</div>
    </section>
  );
}

import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
}

export function SectionCard({ title, subtitle, children, rightSlot }: SectionCardProps) {
  return (
    <section className="surface-card relative overflow-hidden p-5 md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#1a2a69,#3b82f6,#ffffff)]" />
      {title ? (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 pb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">{subtitle}</p> : null}
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </header>
      ) : null}
      <div>{children}</div>
    </section>
  );
}

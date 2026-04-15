import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: boolean;
}

export function StatCard({ title, value, hint, icon: Icon, trend, accent = false }: StatCardProps) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200/60 bg-white p-4 shadow-soft transition-all hover:shadow-md active:scale-[0.98]">
      {accent ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-brand-600" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 truncate">{title}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      {hint || trend ? (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-2">
          {hint ? <p className="text-[0.68rem] font-bold text-slate-500 truncate">{hint}</p> : <div />}
          {trend ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[0.6rem] font-black text-emerald-700">
              {trend}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

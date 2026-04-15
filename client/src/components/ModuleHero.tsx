import type { LucideIcon } from "lucide-react";

interface ModuleHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  chips: string[];
  spotlight?: string;
}

export function ModuleHero({ icon: Icon, title, subtitle, chips, spotlight }: ModuleHeroProps) {
  return (
    <section className="hero-panel relative overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7 text-white shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)] pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-white shadow-lg">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{title}</h3>
            <p className="mt-1.5 text-sm font-medium text-white/80 max-w-2xl leading-relaxed">{subtitle}</p>
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((chip, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[0.6rem] font-black uppercase tracking-widest text-white/90">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {spotlight ? (
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/60">Insight</p>
            <p className="text-lg font-black tracking-tight text-white">{spotlight}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

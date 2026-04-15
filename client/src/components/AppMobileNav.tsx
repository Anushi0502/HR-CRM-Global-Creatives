import clsx from "clsx";
import { NavLink } from "react-router-dom";
import type { NavItem } from "../types/navigation";

interface AppMobileNavProps {
  items: NavItem[];
}

export function AppMobileNav({ items }: AppMobileNavProps) {
  const navItems = items.filter((item) => !item.footerOnly);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/90 pb-[env(safe-area-inset-bottom)] border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
      <ul className="flex justify-around items-center px-2 py-1">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1 min-w-0">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.6rem] font-black uppercase tracking-widest transition-all duration-200",
                  isActive 
                    ? "text-brand-700 bg-brand-50/50" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                  <span className="truncate max-w-[70px]">{item.label}</span>
                  {isActive && <span className="h-1 w-4 rounded-full bg-brand-600 mt-0.5" />}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

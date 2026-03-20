import type { Notification } from "../types/hr";

interface NotificationsPanelProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  onMarkAllRead: () => void;
}

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function NotificationsPanel({ notifications, loading, error, unreadCount, onMarkAllRead }: NotificationsPanelProps) {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(110deg,rgba(26,42,105,0.98)_0%,rgba(59,130,246,0.92)_62%,rgba(191,219,254,0.88)_100%)] p-6 shadow-[0_28px_70px_rgba(2,6,23,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_55%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.18),transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#1a2a69,#3b82f6,#ffffff)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <p className="mt-1 text-sm text-slate-300">Stay on top of leave, payroll, and task updates.</p>
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Mark all read
        </button>
      </div>

      <div className="relative mt-5 grid gap-3">
        {loading ? <p className="text-sm text-slate-300">Loading notifications...</p> : null}
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
        {!loading && !error && notifications.length === 0 ? (
          <p className="text-sm text-slate-300">No notifications yet.</p>
        ) : null}
        {notifications.map((item) => {
          const timestamp = formatTimestamp(item.createdAt);
          return (
            <article
              key={item.id}
              className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur ${item.read ? "opacity-70" : "ring-1 ring-emerald-300/20"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-300">{item.message}</p>
                </div>
                {!item.read ? (
                  <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-emerald-100">
                    New
                  </span>
                ) : null}
              </div>
              {timestamp ? <p className="mt-3 text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">{timestamp}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

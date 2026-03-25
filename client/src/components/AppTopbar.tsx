import { Bell, ChevronDown, Clock3, LogOut, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { hrService } from "../services/hrService";
import type { AttendanceCheckInMode, AttendanceRecord, Notification } from "../types/hr";
import type { NavItem } from "../types/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface AppTopbarProps {
  onSignOut: () => void;
  items: NavItem[];
  workspaceLabel: string;
  onToggleNotifications?: () => void;
  onCloseNotifications?: () => void;
  notifications?: Notification[];
  notificationsLoading?: boolean;
  notificationsError?: string | null;
  onMarkAllRead?: () => void;
  unreadNotifications?: number;
  notificationsOpen?: boolean;
}

type BreakKey = "bio" | "lunch" | "tea" | "meetingTraining";

type BreakConfig = {
  key: BreakKey;
  label: string;
  redAtMinutes?: number;
};

type BreakState = Record<BreakKey, { totalMs: number; activeStart: number | null }>;

const breakConfigs: BreakConfig[] = [
  { key: "bio", label: "Bio", redAtMinutes: 15 },
  { key: "lunch", label: "Lunch", redAtMinutes: 35 },
  { key: "tea", label: "Tea break", redAtMinutes: 20 },
  { key: "meetingTraining", label: "Meeting / Training" },
];

const createInitialBreaks = (): BreakState => ({
  bio: { totalMs: 0, activeStart: null },
  lunch: { totalMs: 0, activeStart: null },
  tea: { totalMs: 0, activeStart: null },
  meetingTraining: { totalMs: 0, activeStart: null },
});

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

const formatNotificationTimestamp = (value: string) => {
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

const toCheckInTimestamp = (value: string): number | null => {
  if (!value || value === "--") {
    return null;
  }
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.getTime();
};

function resolveCurrentTitle(pathname: string, items: NavItem[], fallback: string): string {
  const sorted = [...items].sort((left, right) => right.path.length - left.path.length);
  const match = sorted.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
  return match?.label ?? fallback;
}

export function AppTopbar({
  onSignOut,
  items,
  workspaceLabel,
  onToggleNotifications,
  onCloseNotifications,
  notifications = [],
  notificationsLoading = false,
  notificationsError = null,
  onMarkAllRead,
  unreadNotifications = 0,
  notificationsOpen = false,
}: AppTopbarProps) {
  const location = useLocation();
  const trackerRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [timeLabel, setTimeLabel] = useState(() =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()),
  );
  const [checkInAt, setCheckInAt] = useState<number | null>(null);
  const [activeBreak, setActiveBreak] = useState<BreakKey | null>(null);
  const [breaks, setBreaks] = useState<BreakState>(() => createInitialBreaks());
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [breakMenuOpen, setBreakMenuOpen] = useState(false);

  const currentTitle = useMemo(
    () => resolveCurrentTitle(location.pathname, items, workspaceLabel),
    [items, location.pathname, workspaceLabel],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLabel(
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      );
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (trackerRef.current && !trackerRef.current.contains(target)) {
        setTrackerOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(target)) {
        onCloseNotifications?.();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTrackerOpen(false);
        onCloseNotifications?.();
      }
    };

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCloseNotifications]);

  const totalBreakMs = useMemo(() => {
    return (Object.keys(breaks) as BreakKey[]).reduce((total, key) => {
      const entry = breaks[key];
      const activeMs = entry.activeStart ? now - entry.activeStart : 0;
      return total + entry.totalMs + activeMs;
    }, 0);
  }, [breaks, now]);

  const timeOnSystemMs = checkInAt ? Math.max(0, now - checkInAt - totalBreakMs) : 0;
  const checkedOut = Boolean(attendanceRecord && attendanceRecord.checkOut !== "--");
  const activeBreakLabel = activeBreak ? breakConfigs.find((config) => config.key === activeBreak)?.label : null;

  const getBreakElapsed = (key: BreakKey) => {
    const entry = breaks[key];
    return entry.totalMs + (entry.activeStart ? now - entry.activeStart : 0);
  };
  const activeBreakElapsed = activeBreak ? getBreakElapsed(activeBreak) : 0;

  const applyAttendanceRecord = useCallback((record: AttendanceRecord | null) => {
    setAttendanceRecord(record);
    const nextCheckInAt =
      record && record.checkOut === "--"
        ? record.checkInAt
          ? new Date(record.checkInAt).getTime()
          : toCheckInTimestamp(record.checkIn)
        : null;
    setCheckInAt(nextCheckInAt);
  }, []);

  const loadTodayAttendance = useCallback(async () => {
    try {
      const record = await hrService.getMyTodayAttendance();
      applyAttendanceRecord(record);
      setAttendanceError(null);
    } catch (error) {
      setAttendanceError(error instanceof Error ? error.message : "Unable to load attendance.");
    }
  }, [applyAttendanceRecord]);

  useEffect(() => {
    void loadTodayAttendance();
  }, [loadTodayAttendance]);

  useEffect(() => {
    if (!trackerOpen) {
      setBreakMenuOpen(false);
    }
  }, [trackerOpen]);

  const handleCheckIn = async (mode: AttendanceCheckInMode) => {
    if (attendanceBusy) {
      return;
    }
    setAttendanceBusy(true);
    setAttendanceError(null);
    try {
      const record = await hrService.markMyAttendance(mode);
      applyAttendanceRecord(record);
      setActiveBreak(null);
      setBreaks(createInitialBreaks());
    } catch (error) {
      setAttendanceError(error instanceof Error ? error.message : "Unable to check in.");
    } finally {
      setAttendanceBusy(false);
    }
  };

  const handleCheckOut = async () => {
    if (attendanceBusy) {
      return;
    }
    setAttendanceBusy(true);
    setAttendanceError(null);
    try {
      const breakSummary = breakConfigs.reduce<Record<string, number>>((acc, config) => {
        acc[config.key] = Math.round(getBreakElapsed(config.key) / 60000);
        return acc;
      }, {});
      const record = await hrService.markMyCheckOut({
        breakMinutes: Math.round(totalBreakMs / 60000),
        breakSummary,
      });
      applyAttendanceRecord(record);
      setActiveBreak(null);
      setBreaks(createInitialBreaks());
    } catch (error) {
      setAttendanceError(error instanceof Error ? error.message : "Unable to check out.");
    } finally {
      setAttendanceBusy(false);
    }
  };

  const handleBreakToggle = (key: BreakKey) => {
    if (!checkInAt) {
      return;
    }

    setBreaks((prev) => {
      const next = { ...prev };

      if (activeBreak && prev[activeBreak].activeStart) {
        const elapsed = now - prev[activeBreak].activeStart;
        next[activeBreak] = {
          totalMs: prev[activeBreak].totalMs + elapsed,
          activeStart: null,
        };
      }

      if (activeBreak === key) {
        return next;
      }

      if (!activeBreak) {
        next[key] = {
          totalMs: prev[key].totalMs,
          activeStart: now,
        };
      }

      if (activeBreak && activeBreak !== key) {
        next[key] = {
          totalMs: prev[key].totalMs,
          activeStart: now,
        };
      }

      return next;
    });

    if (activeBreak === key) {
      setActiveBreak(null);
      return;
    }

    if (!activeBreak || activeBreak !== key) {
      setActiveBreak(key);
    }
  };

  return (
    <header className="app-topbar sticky top-0 z-20 border-b backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-brand-800">HR CRM Workspace</p>
            <p className="truncate text-base font-semibold text-slate-950">{workspaceLabel}</p>
            <p className="truncate text-sm font-medium text-slate-700">{currentTitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/55 bg-white/68 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:inline-flex">
            <Clock3 className="h-4 w-4 text-brand-700" />
            {timeLabel}
          </div>
          <ThemeToggle className="hidden sm:inline-flex" />
          <div ref={trackerRef} className="relative">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTrackerOpen((value) => !value)}
                className="time-tracker-trigger inline-flex items-center gap-2 rounded-full border border-brand-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_55%,#ffffff_100%)] px-3 py-2 text-sm font-bold text-slate-800 shadow-[0_14px_30px_rgba(56,189,248,0.25)] transition hover:shadow-[0_18px_36px_rgba(56,189,248,0.3)] whitespace-nowrap"
              >
                <Clock3 className="h-4 w-4 text-brand-700" />
                {activeBreak ? (
                  <>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Break</span>
                    <span className="text-xs font-bold text-slate-700">{activeBreakLabel}</span>
                    <span className="tabular-nums text-xs font-black text-slate-500">
                      {formatDuration(activeBreakElapsed)}
                    </span>
                  </>
                ) : (
                  <>
                    Time tracking
                    <span className="tabular-nums text-xs font-black text-slate-500">
                      {checkInAt ? formatDuration(timeOnSystemMs) : "00:00"}
                    </span>
                  </>
                )}
              </button>
              {activeBreak ? (
                <button
                  type="button"
                  onClick={() => handleBreakToggle(activeBreak)}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-700 shadow-[0_10px_22px_rgba(16,185,129,0.18)] transition hover:brightness-105"
                >
                  Resume
                </button>
              ) : null}
            </div>

            {trackerOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-[min(92vw,420px)]">
                <div className="rounded-3xl border border-white/60 bg-white/95 p-4 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
                    <div className="time-tracker-divider flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <p className="time-tracker-eyebrow text-[0.78rem] font-black uppercase tracking-[0.26em] text-brand-700">
                          Time tracking
                        </p>
                        <p className="time-tracker-desc mt-1 text-lg font-semibold text-slate-700">
                          Start with check-in, then track breaks and end with checkout.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTrackerOpen(false)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500"
                        >
                          Esc
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrackerOpen(false)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                          aria-label="Close time tracking"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 h-1 w-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#38bdf8,#1d4ed8)]" />

                    <div className="mt-4 grid gap-3">
                      {checkInAt ? (
                        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-800 shadow-[0_10px_22px_rgba(16,185,129,0.18)]">
                          <span>Checked in</span>
                          <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-emerald-700">Active shift</span>
                        </div>
                      ) : checkedOut ? (
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                          <span>Checked out</span>
                          <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-slate-400">Shift closed</span>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCheckIn("office")}
                            disabled={attendanceBusy}
                            className="w-full rounded-2xl border border-emerald-400 bg-[linear-gradient(135deg,#22c55e,#10b981)] px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_26px_rgba(34,197,94,0.38)] transition hover:brightness-110 disabled:opacity-70"
                          >
                            Check in office
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCheckIn("remote")}
                            disabled={attendanceBusy}
                            className="w-full rounded-2xl border border-emerald-300 bg-[linear-gradient(135deg,#4ade80,#22c55e)] px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_22px_rgba(34,197,94,0.32)] transition hover:brightness-110 disabled:opacity-70"
                          >
                            Check in remote
                          </button>
                        </div>
                      )}

                      <div className="time-tracker-pill flex w-full items-center justify-between rounded-2xl border border-amber-200/70 bg-[linear-gradient(135deg,#fef9c3,#e0f2fe)] px-4 py-2 shadow-[0_12px_26px_rgba(251,191,36,0.25)]">
                        <span className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-brand-700" />
                          <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500">
                            Time on system
                          </span>
                        </span>
                        <span className="time-tracker-pill-value tabular-nums text-lg font-black text-slate-900">
                          {checkInAt ? formatDuration(timeOnSystemMs) : "00:00"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckOut}
                        disabled={!checkInAt || attendanceBusy}
                        className={`w-full rounded-2xl border px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] transition ${
                          checkInAt
                            ? "!border-red-600 !bg-red-600 text-white shadow-[0_12px_28px_rgba(239,68,68,0.45)] hover:brightness-110"
                            : "!border-red-500 !bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.25)]"
                        }`}
                      >
                        Check out
                      </button>
                    </div>

                    {attendanceError ? (
                      <p className="mt-3 text-xs font-semibold text-rose-600">{attendanceError}</p>
                    ) : null}

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setBreakMenuOpen((value) => !value)}
                        disabled={!checkInAt}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.08)] transition hover:shadow-[0_14px_26px_rgba(15,23,42,0.12)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <span>{activeBreakLabel ? `Break: ${activeBreakLabel}` : "Select break"}</span>
                        <ChevronDown className={`h-4 w-4 transition ${breakMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                      <span className={`mt-2 block text-xs font-semibold ${activeBreakLabel ? "text-amber-700" : "text-slate-500"}`}>
                        {activeBreakLabel ? `Active: ${activeBreakLabel}` : "No active break"}
                      </span>

                      {breakMenuOpen ? (
                        <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                          {breakConfigs.map((config) => {
                            const elapsed = getBreakElapsed(config.key);
                            const isActive = activeBreak === config.key;
                            const overLimit =
                              config.redAtMinutes !== undefined && elapsed >= config.redAtMinutes * 60_000;
                            const variant = !checkInAt ? "disabled" : overLimit ? "limit" : isActive ? "active" : "neutral";
                            const stateClasses = !checkInAt
                              ? "border-slate-200 bg-slate-100 text-slate-400"
                              : overLimit
                                ? "border-rose-300 bg-[linear-gradient(135deg,#fee2e2,#fecaca)] text-rose-800 shadow-[0_8px_18px_rgba(244,63,94,0.2)]"
                                : isActive
                                  ? "border-amber-300 bg-[linear-gradient(135deg,#fef3c7,#fde68a)] text-amber-900 shadow-[0_8px_18px_rgba(245,158,11,0.25)]"
                                  : "border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_22px_rgba(15,23,42,0.12)]";

                            return (
                              <button
                                key={config.key}
                                type="button"
                                onClick={() => handleBreakToggle(config.key)}
                                disabled={!checkInAt}
                                className={`time-tracker-break time-tracker-break--${variant} flex items-center justify-between rounded-2xl border px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.18em] transition ${stateClasses}`}
                              >
                                <span>{config.label}</span>
                                <span className="tabular-nums text-sm font-black tracking-normal">
                                  {checkInAt ? formatDuration(elapsed) : "--:--"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                </div>
              </div>
            ) : null}
          </div>
          <div ref={alertsRef} className="relative">
            <button
              type="button"
              onClick={() => onToggleNotifications?.()}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition ${
                notificationsOpen
                  ? "border-brand-200 bg-brand-50 text-brand-900"
                  : "border-white/55 bg-white/68 text-slate-700 hover:bg-white"
              }`}
            >
              <Bell className="h-4 w-4" />
              Alerts
              {unreadNotifications > 0 ? (
                <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                  {unreadNotifications}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-[min(92vw,360px)]">
                <div className="rounded-3xl border border-white/50 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-brand-700">
                        Alerts
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Stay on top of leave, payroll, and task updates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCloseNotifications?.()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                      aria-label="Close alerts"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMarkAllRead?.()}
                      disabled={unreadNotifications === 0}
                      className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.25em] text-brand-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark all read
                    </button>
                    {unreadNotifications > 0 ? (
                      <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.24em] text-emerald-700">
                        {unreadNotifications} new
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid max-h-72 gap-2 overflow-auto pr-1">
                    {notificationsLoading ? (
                      <p className="text-xs font-semibold text-slate-500">Loading alerts...</p>
                    ) : null}
                    {notificationsError ? (
                      <p className="text-xs font-semibold text-rose-600">{notificationsError}</p>
                    ) : null}
                    {!notificationsLoading && !notificationsError && notifications.length === 0 ? (
                      <p className="text-xs font-semibold text-slate-500">No alerts yet.</p>
                    ) : null}
                    {notifications.map((item) => {
                      const timestamp = formatNotificationTimestamp(item.createdAt);
                      return (
                        <article
                          key={item.id}
                          className={`rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-[0_10px_22px_rgba(15,23,42,0.06)] ${
                            item.read ? "opacity-80" : "ring-1 ring-emerald-300/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="text-xs font-medium text-slate-600">{item.message}</p>
                            </div>
                            {!item.read ? (
                              <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.2em] text-emerald-700">
                                New
                              </span>
                            ) : null}
                          </div>
                          {timestamp ? (
                            <p className="mt-2 text-[0.6rem] font-black uppercase tracking-[0.24em] text-slate-400">
                              {timestamp}
                            </p>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={onSignOut} className="btn-primary px-4 py-2.5">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

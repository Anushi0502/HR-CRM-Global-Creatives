import { Bell, ChevronDown, Clock3, LogOut, Play, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { hrService } from "../services/hrService";
import type {
  AttendanceBreakKey,
  AttendanceBreakSession,
  AttendanceCheckInMode,
  AttendanceRecord,
  Notification,
} from "../types/hr";
import type { NavItem } from "../types/navigation";
import {
  BREAK_CONFIGS as breakConfigs,
  BREAK_KEYS,
  LIVE_BREAK_STORAGE_KEY,
  normalizeBreakSummary,
} from "../utils/attendanceBreaks";
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

type BreakKey = AttendanceBreakKey;

type BreakState = Record<BreakKey, { totalMs: number; activeStart: number | null }>;

const createInitialBreaks = (): BreakState =>
  BREAK_KEYS.reduce(
    (acc, key) => {
      acc[key] = { totalMs: 0, activeStart: null };
      return acc;
    },
    {} as BreakState,
  );

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

const readLiveBreak = (): { key: BreakKey; startedAt: number } | null => {
  try {
    const raw = window.localStorage.getItem(LIVE_BREAK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { key?: BreakKey; startedAt?: number };
    if (!parsed.key || !parsed.startedAt) return null;
    if (!breakConfigs.some((config) => config.key === parsed.key)) return null;
    return { key: parsed.key, startedAt: parsed.startedAt };
  } catch {
    return null;
  }
};

const writeLiveBreak = (payload: { key: BreakKey; startedAt: number } | null) => {
  if (!payload) {
    window.localStorage.removeItem(LIVE_BREAK_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(LIVE_BREAK_STORAGE_KEY, JSON.stringify(payload));
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
  const checkInRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const lastProgressSyncRef = useRef(0);
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
  const [breakSessions, setBreakSessions] = useState<AttendanceBreakSession[]>([]);
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [checkInMenuOpen, setCheckInMenuOpen] = useState(false);

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
      if (checkInRef.current && !checkInRef.current.contains(target)) {
        setCheckInMenuOpen(false);
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
  const checkInDisabled = attendanceBusy || Boolean(checkInAt) || checkedOut;
  const checkOutDisabled = attendanceBusy || !checkInAt;

  const getBreakElapsed = (key: BreakKey) => {
    const entry = breaks[key];
    return entry.totalMs + (entry.activeStart ? now - entry.activeStart : 0);
  };
  const getBreakSessionElapsed = (key: BreakKey) => {
    const entry = breaks[key];
    return entry.activeStart ? now - entry.activeStart : 0;
  };
  const activeBreakElapsed = activeBreak ? getBreakSessionElapsed(activeBreak) : 0;
  const breakSessionCounts = useMemo(
    () =>
      breakSessions.reduce(
        (acc, session) => {
          acc[session.key] += 1;
          return acc;
        },
        BREAK_KEYS.reduce(
          (acc, key) => {
            acc[key] = 0;
            return acc;
          },
          {} as Record<BreakKey, number>,
        ),
      ),
    [breakSessions],
  );

  const applyAttendanceRecord = useCallback((record: AttendanceRecord | null) => {
    setAttendanceRecord(record);
    const nextCheckInAt =
      record && record.checkOut === "--"
        ? record.checkInAt
          ? new Date(record.checkInAt).getTime()
          : toCheckInTimestamp(record.checkIn)
        : null;
    setCheckInAt(nextCheckInAt);
    const normalizedBreaks = normalizeBreakSummary(record?.breakSummary ?? null);
    const liveBreak = record && record.checkOut === "--" ? readLiveBreak() : null;
    setActiveBreak(liveBreak?.key ?? null);
    setBreakSessions(() => {
      const nextSessions = [...normalizedBreaks.sessions];

      if (liveBreak && !nextSessions.some((session) => session.key === liveBreak.key && session.endedAt === null)) {
        nextSessions.push({
          id: `${liveBreak.key}-${liveBreak.startedAt}`,
          key: liveBreak.key,
          minutes: 0,
          startedAt: new Date(liveBreak.startedAt).toISOString(),
          endedAt: null,
        });
      }

      return nextSessions;
    });
    setBreaks(() => {
      const next = createInitialBreaks();

      if (!record || record.checkOut !== "--") {
        return next;
      }

      breakConfigs.forEach((config) => {
        const recordedMs = normalizedBreaks.totals[config.key] * 60_000;

        if (liveBreak?.key === config.key) {
          const liveElapsedMs = Math.max(0, Date.now() - liveBreak.startedAt);
          next[config.key] = {
            totalMs: Math.max(0, recordedMs - liveElapsedMs),
            activeStart: liveBreak.startedAt,
          };
          return;
        }

        next[config.key] = { totalMs: recordedMs, activeStart: null };
      });

      return next;
    });
  }, []);

  const buildBreakSnapshot = useCallback(
    (
      state: BreakState,
      sessions: AttendanceBreakSession[],
      timestamp: number,
      closeOpenSessions = false,
    ) => {
      const summary = BREAK_KEYS.reduce(
        (acc, key) => {
          const entry = state[key];
          const activeMs = entry.activeStart ? timestamp - entry.activeStart : 0;
          acc[key] = Math.round((entry.totalMs + activeMs) / 60000);
          return acc;
        },
        {} as Record<BreakKey, number>,
      );
      const normalizedSessions = sessions.map((session) => {
        const activeStart = state[session.key].activeStart;
        if (session.endedAt === null && activeStart) {
          return {
            ...session,
            minutes: Math.max(0, Math.round((timestamp - activeStart) / 60000)),
            endedAt: closeOpenSessions ? new Date(timestamp).toISOString() : null,
          };
        }
        return session;
      });
      const breakMinutes = Object.values(summary).reduce((sum, value) => sum + (value ?? 0), 0);
      return {
        breakMinutes,
        breakSummary: {
          totals: summary,
          sessions: normalizedSessions,
        },
      };
    },
    [],
  );

  const persistAttendanceProgress = useCallback(
    async (snapshot: { breakMinutes: number; breakSummary: AttendanceRecord["breakSummary"] }) => {
      if (!checkInAt || attendanceBusy || !attendanceRecord || attendanceRecord.checkOut !== "--") {
        return;
      }
      const existingTotal = attendanceRecord.breakSummary
        ? Object.values(normalizeBreakSummary(attendanceRecord.breakSummary).totals).reduce(
            (sum, value) => sum + (value ?? 0),
            0,
          )
        : attendanceRecord.breakMinutes ?? 0;
      if (existingTotal > 0 && snapshot.breakMinutes === 0) {
        return;
      }
      const nowMs = Date.now();
      if (nowMs - lastProgressSyncRef.current < 15_000) {
        return;
      }
      lastProgressSyncRef.current = nowMs;
      const timeOnSystemMinutes = Math.max(0, Math.round((nowMs - checkInAt) / 60000) - snapshot.breakMinutes);

      try {
        const record = await hrService.updateMyAttendanceProgress({
          breakMinutes: snapshot.breakMinutes,
          breakSummary: snapshot.breakSummary,
          timeOnSystemMinutes,
        });
        if (record) {
          applyAttendanceRecord(record);
        }
      } catch (error) {
        // Silent fail: we still track breaks locally and will retry later.
      }
    },
    [attendanceBusy, attendanceRecord, checkInAt, applyAttendanceRecord],
  );

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
    if (!checkInAt || !attendanceRecord || attendanceRecord.checkOut !== "--") {
      return;
    }
    const snapshot = buildBreakSnapshot(breaks, breakSessions, Date.now());
    void persistAttendanceProgress(snapshot);
  }, [attendanceRecord, breaks, breakSessions, buildBreakSnapshot, checkInAt, persistAttendanceProgress]);

  const handleCheckInSelect = (mode: AttendanceCheckInMode) => {
    setCheckInMenuOpen(false);
    void handleCheckIn(mode);
  };

  useEffect(() => {
    if (!checkInAt || checkedOut) {
      writeLiveBreak(null);
      setActiveBreak(null);
      return;
    }

    const stored = readLiveBreak();
    if (stored) {
      setActiveBreak(stored.key);
      setBreaks((prev) => ({
        ...prev,
        [stored.key]: {
          totalMs: prev[stored.key].totalMs,
          activeStart: stored.startedAt,
        },
      }));
    }
  }, [checkInAt, checkedOut]);

  const handleCheckIn = async (mode: AttendanceCheckInMode) => {
    if (attendanceBusy) {
      return;
    }
    setAttendanceBusy(true);
    setAttendanceError(null);
    setCheckInMenuOpen(false);
    setTrackerOpen(false);
    try {
      const record = await hrService.markMyAttendance(mode);
      applyAttendanceRecord(record);
      setActiveBreak(null);
      setBreaks(createInitialBreaks());
      setBreakSessions([]);
      writeLiveBreak(null);
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
    setCheckInMenuOpen(false);
    setTrackerOpen(false);
    try {
      const snapshot = buildBreakSnapshot(breaks, breakSessions, now, true);
      const timeOnSystemMinutes = Math.max(0, Math.round(timeOnSystemMs / 60000));
      const record = await hrService.markMyCheckOut({
        breakMinutes: snapshot.breakMinutes,
        breakSummary: snapshot.breakSummary,
        timeOnSystemMinutes,
      });
      applyAttendanceRecord(record);
      setActiveBreak(null);
      setBreaks(createInitialBreaks());
      setBreakSessions([]);
      writeLiveBreak(null);
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

    const targetConfig = breakConfigs.find((config) => config.key === key);
    const sessionLimitReached =
      activeBreak !== key &&
      targetConfig?.sessionLimit !== null &&
      targetConfig?.sessionLimit !== undefined &&
      breakSessionCounts[key] >= targetConfig.sessionLimit;

    if (sessionLimitReached) {
      setAttendanceError(
        `${targetConfig.label} can only be used ${targetConfig.sessionLimit} ${
          targetConfig.sessionLimit === 1 ? "time" : "times"
        } today.`,
      );
      return;
    }

    setAttendanceError(null);

    const nextActiveBreak = activeBreak === key ? null : key;
    const nowIso = new Date(now).toISOString();

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
    setBreakSessions((prev) => {
      const next = prev.map((session) => {
        if (activeBreak && session.key === activeBreak && session.endedAt === null) {
          const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : now;
          return {
            ...session,
            minutes: Math.max(0, Math.round((now - startedAt) / 60000)),
            endedAt: nowIso,
          };
        }

        return session;
      });

      if (nextActiveBreak) {
        next.push({
          id: `${nextActiveBreak}-${now}`,
          key: nextActiveBreak,
          minutes: 0,
          startedAt: nowIso,
          endedAt: null,
        });
      }

      return next;
    });

    setActiveBreak(nextActiveBreak);
    if (nextActiveBreak) {
      writeLiveBreak({ key: nextActiveBreak, startedAt: now });
    } else {
      writeLiveBreak(null);
    }

    setTrackerOpen(false);
  };

  return (
    <header
      className="app-topbar sticky top-0 z-20 border-b backdrop-blur-xl"
      aria-label={`${workspaceLabel} ${currentTitle}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/55 bg-white/68 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:inline-flex">
            <Clock3 className="h-4 w-4 text-brand-700" />
            {timeLabel}
          </div>
          <div className="relative">
            <ThemeToggle className="min-h-[42px]" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div ref={checkInRef} className="relative">
            <button
              type="button"
              onClick={() => {
                if (checkInDisabled) return;
                setCheckInMenuOpen((value) => !value);
                setTrackerOpen(false);
              }}
              disabled={checkInDisabled}
              className="topbar-accent-button topbar-accent-button--success inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-300 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.18em] shadow-[0_10px_22px_rgba(5,150,105,0.26)] transition hover:brightness-105 disabled:opacity-90"
            >
              {checkInAt ? "Checked in" : checkedOut ? "Checked out" : "Check in"}
              <ChevronDown className={`h-4 w-4 transition ${checkInMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {checkInMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-44 rounded-2xl border border-emerald-500 bg-emerald-200/95 p-2 shadow-[0_18px_40px_rgba(5,150,105,0.24)]">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleCheckInSelect("office")}
                    className="topbar-accent-button topbar-accent-button--success rounded-xl border border-emerald-600 bg-emerald-300 px-3 py-2 text-left text-[0.65rem] font-black uppercase tracking-[0.18em] shadow-[0_8px_18px_rgba(5,150,105,0.26)]"
                  >
                    Check in office
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckInSelect("remote")}
                    className="topbar-accent-button topbar-accent-button--success rounded-xl border border-emerald-600 bg-emerald-300 px-3 py-2 text-left text-[0.65rem] font-black uppercase tracking-[0.18em] shadow-[0_8px_18px_rgba(5,150,105,0.26)]"
                  >
                    Check in remote
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div ref={trackerRef} className="relative">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTrackerOpen((value) => !value);
                  setCheckInMenuOpen(false);
                }}
                aria-expanded={trackerOpen}
                className="time-tracker-trigger inline-flex items-center gap-2 rounded-full border border-brand-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_55%,#ffffff_100%)] px-3 py-2 text-sm font-bold text-slate-900 shadow-[0_14px_30px_rgba(56,189,248,0.25)] transition hover:shadow-[0_18px_36px_rgba(56,189,248,0.3)] whitespace-nowrap dark:border-slate-700/60 dark:bg-[linear-gradient(135deg,#0b1224_0%,#1e293b_55%,#0f172a_100%)] dark:text-white"
              >
                <Clock3 className="h-4 w-4 text-brand-700" />
                {activeBreak ? (
                  <>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeBreakLabel}</span>
                    <span className="tabular-nums text-xs font-black text-slate-700 dark:text-slate-300">
                      {formatDuration(activeBreakElapsed)}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition ${trackerOpen ? "rotate-180" : ""}`} />
                  </>
                ) : (
                  <>
                    Login hours
                    <span className="tabular-nums text-xs font-black text-slate-700 dark:text-slate-300">
                      {checkInAt ? formatDuration(timeOnSystemMs) : "00:00"}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition ${trackerOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>
              {activeBreak ? (
                <button
                  type="button"
                  onClick={() => handleBreakToggle(activeBreak)}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-700 shadow-[0_10px_22px_rgba(16,185,129,0.18)] transition hover:brightness-105"
                  aria-label="Resume"
                >
                  <Play className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {trackerOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-[280px] max-w-[90vw]">
                <div className="rounded-3xl border border-white/50 bg-white/95 p-4 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur max-h-[80vh] overflow-auto">
                  <div className="time-tracker-divider flex items-center justify-end gap-2">
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

                  {attendanceError ? (
                    <p className="mt-3 text-xs font-semibold text-rose-600">{attendanceError}</p>
                  ) : null}

                  <div className="mt-4">
                    <span
                      className={`block text-xs font-semibold ${
                        activeBreakLabel ? "text-amber-700" : checkInAt ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {activeBreakLabel
                        ? `Active: ${activeBreakLabel}`
                        : checkInAt
                          ? "Choose a break below."
                          : "Check in first to start a break."}
                    </span>

                    <div className="mt-3 w-full rounded-2xl border border-slate-200 bg-white/98 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)] max-h-64 overflow-auto">
                        <div className="flex flex-col gap-2">
                        {breakConfigs.map((config) => {
                          const isActive = activeBreak === config.key;
                          const elapsed = isActive ? getBreakSessionElapsed(config.key) : getBreakElapsed(config.key);
                          const sessionCount = breakSessionCounts[config.key];
                          const sessionLimitReached =
                            !isActive &&
                            config.sessionLimit !== null &&
                            sessionCount >= config.sessionLimit;
                          const overLimit =
                            config.redAtMinutes !== undefined && elapsed >= config.redAtMinutes * 60_000;
                          const buttonDisabled = !checkInAt || sessionLimitReached;
                          const variant = buttonDisabled
                            ? "disabled"
                            : overLimit
                              ? "limit"
                              : isActive
                                ? "active"
                                : "neutral";
                          const stateClasses = buttonDisabled
                            ? "border-slate-200 bg-slate-100 text-slate-400"
                            : overLimit
                              ? "border-rose-300 bg-[linear-gradient(135deg,#fee2e2,#fecaca)] text-rose-800 shadow-[0_8px_18px_rgba(244,63,94,0.2)]"
                              : isActive
                                ? "border-amber-300 bg-[linear-gradient(135deg,#fef3c7,#fde68a)] text-amber-900 shadow-[0_8px_18px_rgba(245,158,11,0.25)]"
                                : "border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_22px_rgba(15,23,42,0.12)]";
                          const usageLabel =
                            config.sessionLimit !== null
                              ? `${Math.min(sessionCount, config.sessionLimit)}/${config.sessionLimit} used`
                              : null;

                          return (
                            <button
                              key={config.key}
                              type="button"
                              onClick={() => handleBreakToggle(config.key)}
                              disabled={buttonDisabled}
                              className={`time-tracker-break time-tracker-break--${variant} flex flex-col items-start rounded-2xl border px-3 py-2 text-left text-[0.7rem] font-black uppercase tracking-[0.18em] transition ${stateClasses}`}
                            >
                              <span>{config.label}</span>
                              <span
                                className={`mt-1 text-xs font-semibold tracking-normal ${
                                  buttonDisabled ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                {checkInAt ? formatDuration(elapsed) : "--:--"}
                                {usageLabel ? ` | ${usageLabel}` : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={checkOutDisabled}
            className="topbar-accent-button topbar-accent-button--danger rounded-full border border-rose-600 bg-rose-400 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.18em] shadow-[0_10px_22px_rgba(136,19,55,0.28)] transition hover:brightness-105 disabled:opacity-90"
          >
            Check out
          </button>
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
              <div className="absolute right-0 top-full z-30 mt-3 w-[280px] max-w-[90vw]">
                <div className="rounded-3xl border border-white/50 bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur max-h-[70vh] overflow-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-brand-700">
                        Alerts
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        Leave, payroll, and task updates.
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

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMarkAllRead?.()}
                      disabled={unreadNotifications === 0}
                      className="rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.22em] text-brand-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark all read
                    </button>
                    {unreadNotifications > 0 ? (
                      <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.22em] text-emerald-700">
                        {unreadNotifications} new
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 grid max-h-72 gap-2 overflow-auto pr-1">
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
                            <p className="mt-2 text-[0.55rem] font-black uppercase tracking-[0.24em] text-slate-400">
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

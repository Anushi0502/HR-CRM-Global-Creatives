import type {
  AttendanceBreakKey,
  AttendanceBreakLegacySummary,
  AttendanceBreakSession,
  AttendanceBreakSummary,
  AttendanceRecord,
} from "../types/hr";

export interface BreakConfig {
  key: AttendanceBreakKey;
  label: string;
  redAtMinutes?: number;
  limit: number | null;
  max: number | null;
  sessionLimit: number | null;
  match: string[];
}

export const LIVE_BREAK_STORAGE_KEY = "gcs-live-break";

export const BREAK_CONFIGS: BreakConfig[] = [
  {
    key: "bio",
    label: "Freshen up break",
    redAtMinutes: 15,
    limit: 15,
    max: 15,
    sessionLimit: null,
    match: ["fresh", "bio", "wash"],
  },
  {
    key: "lunch",
    label: "Lunch break",
    redAtMinutes: 35,
    limit: 30,
    max: 35,
    sessionLimit: 1,
    match: ["lunch"],
  },
  {
    key: "tea",
    label: "Tea break",
    redAtMinutes: 20,
    limit: 15,
    max: 20,
    sessionLimit: 2,
    match: ["tea"],
  },
  {
    key: "meetingTraining",
    label: "Meeting / Training",
    limit: null,
    max: null,
    sessionLimit: null,
    match: ["meeting", "training"],
  },
];

export const BREAK_KEYS: AttendanceBreakKey[] = BREAK_CONFIGS.map((config) => config.key);

export interface NormalizedBreakSummary {
  totals: Record<AttendanceBreakKey, number>;
  sessions: AttendanceBreakSession[];
}

export function createEmptyBreakTotals(): Record<AttendanceBreakKey, number> {
  return {
    bio: 0,
    lunch: 0,
    tea: 0,
    meetingTraining: 0,
  };
}

export function getBreakConfig(key: AttendanceBreakKey): BreakConfig {
  return BREAK_CONFIGS.find((config) => config.key === key) ?? BREAK_CONFIGS[0];
}

function toRoundedMinutes(value: unknown): number {
  const minutes = Number(value ?? 0);
  if (!Number.isFinite(minutes)) {
    return 0;
  }
  return Math.max(0, Math.round(minutes));
}

function isStructuredBreakSummary(
  value: AttendanceRecord["breakSummary"],
): value is AttendanceBreakSummary {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && ("totals" in value || "sessions" in value));
}

function normalizeLegacyTotals(value: AttendanceBreakLegacySummary | Record<string, unknown> | null | undefined) {
  const totals = createEmptyBreakTotals();
  const source = value ?? {};

  BREAK_KEYS.forEach((key) => {
    totals[key] = toRoundedMinutes(source[key]);
  });

  return totals;
}

function normalizeSessions(value: unknown): AttendanceBreakSession[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const session = item as Record<string, unknown>;
      const key = typeof session.key === "string" && BREAK_KEYS.includes(session.key as AttendanceBreakKey)
        ? (session.key as AttendanceBreakKey)
        : null;

      if (!key) {
        return null;
      }

      return {
        id: typeof session.id === "string" && session.id.trim() ? session.id : `${key}-session-${index + 1}`,
        key,
        minutes: toRoundedMinutes(session.minutes),
        startedAt: typeof session.startedAt === "string" ? session.startedAt : null,
        endedAt: typeof session.endedAt === "string" ? session.endedAt : null,
      };
    })
    .filter((session): session is AttendanceBreakSession => Boolean(session));
}

export function normalizeBreakSummary(summary: AttendanceRecord["breakSummary"]): NormalizedBreakSummary {
  if (!summary) {
    return { totals: createEmptyBreakTotals(), sessions: [] };
  }

  if (isStructuredBreakSummary(summary)) {
    const sessions = normalizeSessions(summary.sessions);
    if (sessions.length > 0) {
      const totals = createEmptyBreakTotals();
      sessions.forEach((session) => {
        totals[session.key] += session.minutes;
      });
      return { totals, sessions };
    }

    return {
      totals: normalizeLegacyTotals(summary.totals),
      sessions: [],
    };
  }

  const totals = normalizeLegacyTotals(summary as AttendanceBreakLegacySummary);
  const sessions = BREAK_KEYS.flatMap((key, index) =>
    totals[key] > 0
      ? [
          {
            id: `legacy-${key}-${index + 1}`,
            key,
            minutes: totals[key],
            startedAt: null,
            endedAt: null,
          } satisfies AttendanceBreakSession,
        ]
      : [],
  );

  return { totals, sessions };
}

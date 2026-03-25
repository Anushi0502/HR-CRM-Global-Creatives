import { CalendarDays, Info, Landmark, MinusCircle, Sparkles, Umbrella } from "lucide-react";
import { calculatePayroll } from "../utils/payroll";
import type { PayrollInput } from "../utils/payroll";
import { formatCurrency } from "../utils/formatters";

type PayrollCardProps = PayrollInput & {
  monthLabel: string;
  attendanceDays?: number;
  className?: string;
};

const formatDaysCopy = (payableDays: number, totalDays: number) =>
  `You are paid for ${payableDays} days out of ${totalDays} days`;

const formatMoney = (value: number) => formatCurrency(Number(value.toFixed(2)));

export function PayrollCard({
  monthLabel,
  totalDays,
  baseSalary,
  bonus = 0,
  leaveDays,
  paidHolidays,
  attendanceDays,
  className = "",
}: PayrollCardProps) {
  const summary = calculatePayroll({ totalDays, baseSalary, bonus, leaveDays, paidHolidays });
  const trackedAttendanceDays =
    attendanceDays !== undefined ? Math.max(0, Math.round(attendanceDays)) : summary.payableDays;
  const attendanceNotFoundDays =
    attendanceDays !== undefined
      ? Math.max(0, summary.totalDays - summary.leaveDays - trackedAttendanceDays)
      : 0;
  const payableDays =
    attendanceDays !== undefined
      ? Math.max(0, summary.totalDays - summary.leaveDays - attendanceNotFoundDays)
      : summary.payableDays;
  const attendanceRatio = summary.totalDays > 0 ? trackedAttendanceDays / summary.totalDays : 0;

  return (
    <section
      className={`relative overflow-hidden rounded-[32px] border border-white/20 bg-[linear-gradient(135deg,#0ea5ff_0%,#1d4ed8_55%,#1e3a8a_100%)] p-6 text-white shadow-[0_40px_120px_rgba(15,23,42,0.35)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_45%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.26em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              My Payroll
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
              View your completed salary and breakdown
            </h2>
            <div className="mt-4 h-1 w-28 rounded-full bg-white/35" />
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-white/80">
              <CalendarDays className="h-3.5 w-3.5" />
              {monthLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-white/70">Latest Statement</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-white">{formatMoney(summary.finalSalary)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/75">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Per-day: {formatMoney(summary.perDaySalary)}
              </span>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1"
                title="Final salary = Base + Bonus - (Unpaid leaves x Per-day salary)."
              >
                <Info className="h-3.5 w-3.5" />
                How it's calculated
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white/90">{formatDaysCopy(payableDays, summary.totalDays)}</p>
            <p className={`mt-1 text-sm font-semibold ${summary.unpaidLeaves > 0 ? "text-rose-200" : "text-emerald-100"}`}>
              Unpaid leaves: {summary.unpaidLeaves}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            <span>Attendance</span>
            <span>
              {trackedAttendanceDays}/{summary.totalDays} days
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-white" style={{ width: `${Math.max(6, attendanceRatio * 100)}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/12 p-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-white/70">Working Days</p>
            <p className="mt-2 text-lg font-extrabold text-white">{summary.totalDays}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/12 p-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-white/70">Leaves Taken</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-extrabold text-white">
              <MinusCircle className="h-4 w-4 text-white/80" />
              {summary.leaveDays}
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/12 p-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-white/70">Payable Days</p>
            <p className="mt-2 text-lg font-extrabold text-white">{payableDays}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
            <Landmark className="h-3.5 w-3.5" />
            Deductions are based on unpaid leaves only
          </span>
        </div>
      </div>
    </section>
  );
}

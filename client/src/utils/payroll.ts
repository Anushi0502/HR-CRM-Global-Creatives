export type PayrollInput = {
  totalDays: number;
  baseSalary: number;
  bonus?: number;
  leaveDays: number;
  paidHolidays: number;
};

export type PayrollOutput = {
  totalDays: number;
  baseSalary: number;
  bonus: number;
  leaveDays: number;
  paidHolidaysUsed: number;
  unpaidLeaves: number;
  payableDays: number;
  perDaySalary: number;
  deductionAmount: number;
  finalSalary: number;
};

const sanitizeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

export function calculatePayroll(input: PayrollInput): PayrollOutput {
  const totalDays = Math.max(1, Math.round(sanitizeNumber(input.totalDays)));
  const baseSalary = Math.max(0, sanitizeNumber(input.baseSalary));
  const bonus = Math.max(0, sanitizeNumber(input.bonus ?? 0));
  const leaveDays = Math.max(0, Math.round(sanitizeNumber(input.leaveDays)));
  const paidHolidays = Math.max(0, Math.round(sanitizeNumber(input.paidHolidays)));

  const paidHolidaysUsed = Math.min(leaveDays, paidHolidays);
  const unpaidLeaves = Math.max(0, leaveDays - paidHolidaysUsed);
  const payableDays = Math.max(0, totalDays - unpaidLeaves);
  const perDaySalary = baseSalary / totalDays;
  const deductionAmount = unpaidLeaves * perDaySalary;
  const finalSalary = baseSalary + bonus - deductionAmount;

  return {
    totalDays,
    baseSalary,
    bonus,
    leaveDays,
    paidHolidaysUsed,
    unpaidLeaves,
    payableDays,
    perDaySalary,
    deductionAmount,
    finalSalary,
  };
}

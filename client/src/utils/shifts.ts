import type { Employee, ShiftApprovalStatus, ShiftCode } from "../types/hr";

export interface ShiftDefinition {
  code: ShiftCode;
  label: string;
  startMinutes: number;
  endMinutes: number;
}

export const DEFAULT_SHIFT_CODE: ShiftCode = "shift_1";
export const DEFAULT_SHIFT_APPROVAL_STATUS: ShiftApprovalStatus = "pending";

export const SHIFT_DEFINITIONS: ShiftDefinition[] = [
  {
    code: "shift_1",
    label: "9:30 AM to 6:00 PM",
    startMinutes: 9 * 60 + 30,
    endMinutes: 18 * 60,
  },
  {
    code: "shift_2",
    label: "1:00 PM to 10:00 PM",
    startMinutes: 13 * 60,
    endMinutes: 22 * 60,
  },
  {
    code: "shift_3",
    label: "3:00 PM to 12:00 AM",
    startMinutes: 15 * 60,
    endMinutes: 24 * 60,
  },
];

const shiftMap = new Map(SHIFT_DEFINITIONS.map((shift) => [shift.code, shift]));

export function getShiftDefinition(code: ShiftCode | null | undefined): ShiftDefinition {
  return shiftMap.get(code ?? DEFAULT_SHIFT_CODE) ?? SHIFT_DEFINITIONS[0];
}

export function formatShiftLabel(code: ShiftCode | null | undefined): string {
  return getShiftDefinition(code).label;
}

export function getApprovedShiftDefinition(
  employee: Pick<Employee, "shiftCode" | "shiftApprovalStatus"> | null | undefined,
): ShiftDefinition | null {
  if (!employee || employee.shiftApprovalStatus !== "approved") {
    return null;
  }

  return getShiftDefinition(employee.shiftCode);
}

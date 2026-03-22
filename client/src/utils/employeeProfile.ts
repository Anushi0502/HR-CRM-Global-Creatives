import type { Employee, EmployeeProfileDetailsPayload } from "../types/hr";

export const emptyEmployeeProfileDetails: EmployeeProfileDetailsPayload = {
  mobile: "",
  address: "",
  pan: "",
  bankName: "",
  bankAccountNumber: "",
};

export function toEmployeeProfileDetailsPayload(
  employee: Pick<Employee, "mobile" | "address" | "pan" | "bankName" | "bankAccountNumber"> | null | undefined,
): EmployeeProfileDetailsPayload {
  return {
    mobile: employee?.mobile ?? "",
    address: employee?.address ?? "",
    pan: employee?.pan ?? "",
    bankName: employee?.bankName ?? "",
    bankAccountNumber: employee?.bankAccountNumber ?? "",
  };
}

export function hasCompleteEmployeeProfileDetails(
  employee: Pick<Employee, "mobile" | "address" | "pan" | "bankName" | "bankAccountNumber"> | null | undefined,
): boolean {
  return Boolean(
    employee?.mobile?.trim() &&
      employee.address?.trim() &&
      employee.pan?.trim() &&
      employee.bankName?.trim() &&
      employee.bankAccountNumber?.trim(),
  );
}

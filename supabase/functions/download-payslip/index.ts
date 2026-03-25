import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "https://esm.sh/pdf-lib@1.17.1";
import { GCS_LOGO_URL, companyContact } from "../_shared/brandEmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

interface PayslipRequest {
  payrollRecordId: string;
}

interface PayrollRow {
  id: string;
  employee_id: string | null;
  month: string;
  employee_name: string;
  department: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_pay: number;
  status: string;
}

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  join_date: string;
}

interface PrivateDetailsRow {
  mobile: string | null;
  address: string | null;
  pan: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isServiceRoleToken(token: string | null): boolean {
  if (!token) {
    return false;
  }
  const payload = decodeJwtPayload(token);
  return payload?.role === "service_role";
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function sanitizeFilePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "document";
}

function maskAccount(value: string | null | undefined): string {
  if (!value) {
    return "Pending update";
  }

  const visible = value.slice(-4);
  return `${"*".repeat(Math.max(value.length - 4, 0))}${visible}`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  input: {
    x: number;
    y: number;
    maxWidth: number;
    font: PDFFont;
    size: number;
    lineHeight?: number;
    color?: ReturnType<typeof rgb>;
  },
) {
  const words = text.split(/\s+/);
  const lineHeight = input.lineHeight ?? input.size + 4;
  let line = "";
  let cursorY = input.y;

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (input.font.widthOfTextAtSize(next, input.size) > input.maxWidth && line) {
      page.drawText(line, {
        x: input.x,
        y: cursorY,
        size: input.size,
        font: input.font,
        color: input.color ?? rgb(0.12, 0.16, 0.24),
      });
      cursorY -= lineHeight;
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    page.drawText(line, {
      x: input.x,
      y: cursorY,
      size: input.size,
      font: input.font,
      color: input.color ?? rgb(0.12, 0.16, 0.24),
    });
    cursorY -= lineHeight;
  }

  return cursorY;
}

async function fetchLogo(pdf: PDFDocument) {
  try {
    const response = await fetch(GCS_LOGO_URL);
    if (!response.ok) {
      return null;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}

async function createPayslipPdf(input: {
  payroll: PayrollRow;
  employee: EmployeeRow;
  details: PrivateDetailsRow | null;
  companyName: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const width = page.getWidth();
  const logo = await fetchLogo(pdf);

  page.drawRectangle({ x: 0, y: 748, width, height: 94, color: rgb(0.16, 0.48, 0.61) });
  page.drawText(input.companyName, { x: 40, y: 804, size: 22, font: titleFont, color: rgb(1, 1, 1) });
  page.drawText("Salary Slip", { x: 40, y: 784, size: 12, font: bodyFont, color: rgb(0.89, 0.96, 0.98) });
  if (logo) {
    const scale = Math.min(150 / logo.width, 58 / logo.height);
    const logoDims = logo.scale(scale);
    page.drawImage(logo, {
      x: width - logoDims.width - 34,
      y: 766 + (58 - logoDims.height) / 2,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  page.drawText(`Employee: ${input.employee.name}`, { x: 40, y: 730, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Role: ${input.employee.role}`, { x: 40, y: 712, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Department: ${input.payroll.department}`, { x: 40, y: 694, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Payroll month: ${input.payroll.month}`, { x: 320, y: 730, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Joined: ${input.employee.join_date}`, { x: 320, y: 712, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Location: ${input.employee.location}`, { x: 320, y: 694, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });

  const rows = [
    ["Base salary", formatMoney(input.payroll.base_salary)],
    ["Bonus", formatMoney(input.payroll.bonus)],
    ["Deductions", formatMoney(input.payroll.deductions)],
    ["Net pay", formatMoney(input.payroll.net_pay)],
  ];

  page.drawText("Compensation Summary", { x: 40, y: 642, size: 13, font: titleFont, color: rgb(0.12, 0.16, 0.24) });
  let y = 610;
  for (const [label, value] of rows) {
    page.drawRectangle({ x: 40, y: y - 12, width: 515, height: 26, color: rgb(0.95, 0.98, 0.99) });
    page.drawText(label, { x: 52, y, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
    page.drawText(value, { x: 430, y, size: 11, font: titleFont, color: rgb(0.16, 0.48, 0.61) });
    y -= 38;
  }

  page.drawText("Employee Details", { x: 40, y: 432, size: 13, font: titleFont, color: rgb(0.12, 0.16, 0.24) });
  const details = input.details;
  let detailY = 404;
  detailY = drawWrappedText(page, `Mobile: ${details?.mobile ?? "Pending update"}`, {
    x: 40,
    y: detailY,
    maxWidth: 515,
    font: bodyFont,
    size: 11,
  });
  detailY = drawWrappedText(page, `PAN: ${details?.pan ?? "Pending update"}`, {
    x: 40,
    y: detailY - 2,
    maxWidth: 515,
    font: bodyFont,
    size: 11,
  });
  detailY = drawWrappedText(page, `Bank: ${details?.bank_name ?? "Pending update"}`, {
    x: 40,
    y: detailY - 2,
    maxWidth: 515,
    font: bodyFont,
    size: 11,
  });
  detailY = drawWrappedText(page, `Account: ${maskAccount(details?.bank_account_number)}`, {
    x: 40,
    y: detailY - 2,
    maxWidth: 515,
    font: bodyFont,
    size: 11,
  });
  drawWrappedText(page, `Address: ${details?.address ?? "Pending update"}`, {
    x: 40,
    y: detailY - 2,
    maxWidth: 515,
    font: bodyFont,
    size: 11,
  });

  page.drawRectangle({ x: 40, y: 72, width: 515, height: 170, color: rgb(0.1, 0.18, 0.29) });
  page.drawText("Contact Details", { x: 56, y: 214, size: 15, font: titleFont, color: rgb(1, 1, 1) });

  let contactY = 188;
  contactY = drawWrappedText(page, `Address: ${companyContact.headOffice}`, {
    x: 56,
    y: contactY,
    maxWidth: 220,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });
  contactY = drawWrappedText(page, `Number: ${companyContact.phone}`, {
    x: 56,
    y: contactY - 4,
    maxWidth: 220,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });
  drawWrappedText(page, `Email: ${companyContact.email}`, {
    x: 56,
    y: contactY - 4,
    maxWidth: 220,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });

  page.drawText("Head Office", { x: 316, y: 214, size: 15, font: titleFont, color: rgb(1, 1, 1) });
  let officeY = drawWrappedText(page, companyContact.headOffice, {
    x: 316,
    y: 188,
    maxWidth: 210,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });
  page.drawText("Operational Office", { x: 316, y: officeY - 10, size: 15, font: titleFont, color: rgb(1, 1, 1) });
  drawWrappedText(page, companyContact.operationalOffice, {
    x: 316,
    y: officeY - 36,
    maxWidth: 210,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });

  page.drawText("This payslip was generated by the HR CRM payroll workflow.", {
    x: 56,
    y: 88,
    size: 9,
    font: bodyFont,
    color: rgb(0.73, 0.79, 0.86),
  });

  return pdf.save();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, { status: "failed", message: "Supabase environment is not configured." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse(401, { status: "failed", message: "Missing authorization header." });
  }

  const token = authorization.replace("Bearer ", "").trim();
  const allowServiceRole = isServiceRoleToken(token);

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: caller, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !caller.user) {
    return jsonResponse(401, { status: "failed", message: "Unauthorized request." });
  }

  const payload = (await request.json()) as PayslipRequest;
  if (!payload.payrollRecordId) {
    return jsonResponse(400, { status: "failed", message: "payrollRecordId is required." });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: payroll, error: payrollError } = await adminClient
    .from("payroll_records")
    .select("id, employee_id, month, employee_name, department, base_salary, bonus, deductions, net_pay, status")
    .eq("id", payload.payrollRecordId)
    .maybeSingle();

  if (payrollError) {
    return jsonResponse(200, { status: "failed", message: payrollError.message });
  }

  if (!payroll) {
    return jsonResponse(200, { status: "skipped", message: "Payroll record not found." });
  }

  const payrollRow = payroll as PayrollRow;
  if (payrollRow.status !== "processed") {
    return jsonResponse(200, { status: "skipped", message: "Payslips are only available for completed records." });
  }

  // Access control relaxed: any authenticated user can download payslips.

  let employeeQuery = adminClient.from("employees").select("id, name, email, role, location, join_date");
  if (payrollRow.employee_id) {
    employeeQuery = employeeQuery.eq("id", payrollRow.employee_id);
  } else {
    employeeQuery = employeeQuery.eq("name", payrollRow.employee_name);
  }

  const { data: employee, error: employeeError } = await employeeQuery.maybeSingle();
  if (employeeError) {
    return jsonResponse(200, { status: "failed", message: employeeError.message });
  }

  if (!employee) {
    return jsonResponse(200, { status: "skipped", message: "Linked employee profile not found." });
  }

  const employeeRow = employee as EmployeeRow;
  const { data: details } = await adminClient
    .from("employee_private_details")
    .select("mobile, address, pan, bank_name, bank_account_number")
    .eq("employee_id", employeeRow.id)
    .maybeSingle();
  const { data: settings } = await adminClient.from("crm_settings").select("company_name").limit(1).maybeSingle();
  const companyName = typeof settings?.company_name === "string" ? settings.company_name : "Global Creative Services";
  const fileName = `salary-slip-${sanitizeFilePart(employeeRow.name)}-${sanitizeFilePart(payrollRow.month)}.pdf`;

  try {
    const pdfBytes = await createPayslipPdf({
      payroll: payrollRow,
      employee: employeeRow,
      details: (details as PrivateDetailsRow | null) ?? null,
      companyName,
    });

    return jsonResponse(200, {
      status: "ready",
      message: "Payslip ready.",
      fileName,
      fileBase64: toBase64(pdfBytes),
    });
  } catch (error) {
    return jsonResponse(200, {
      status: "failed",
      message: error instanceof Error ? error.message : "Unable to generate payslip.",
    });
  }
});

export const GCS_LOGO_URL =
  "https://globalcreativeservices.us/wp-content/uploads/2025/04/GCS-website-graphics-4-1-e1764836698409.png";

export const companyContact = {
  phone: "+1 8775787788",
  email: "info@globalcreativeservices.us",
  headOffice: "304 S Jones Blvd, Las Vegas, NV 89107, United States",
  operationalOffice: "B-509, Bhutani Cyber Park, Block-C, Sector 62 Noida, India",
};

export interface EmailHighlight {
  label: string;
  value: string;
}

export interface BrandEmailInput {
  preheader?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  recipientName: string;
  introParagraphs: string[];
  highlights?: EmailHighlight[];
  checklistTitle?: string;
  checklist?: string[];
  spotlightTitle?: string;
  spotlightBody?: string;
  footerNote?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHighlights(highlights: EmailHighlight[]): string {
  if (highlights.length === 0) {
    return "";
  }

  const rows: string[] = [];

  for (let index = 0; index < highlights.length; index += 2) {
    const pair = highlights.slice(index, index + 2);
    rows.push(`
      <tr>
        ${pair
          .map(
            (item) => `
              <td valign="top" style="width:50%; padding:${index === 0 ? "0 6px 12px 0" : "0 6px 0 0"};">
                <div style="background:#f4f8fb; border:1px solid #d7e3f0; border-radius:16px; padding:16px; min-height:92px;">
                  <div style="font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#2a7b9b; font-weight:700;">
                    ${escapeHtml(item.label)}
                  </div>
                  <div style="margin-top:10px; font-size:20px; line-height:1.35; font-weight:700; color:#172033;">
                    ${escapeHtml(item.value)}
                  </div>
                </div>
              </td>
            `,
          )
          .join("")}
        ${pair.length === 1 ? '<td style="width:50%;"></td>' : ""}
      </tr>
    `);
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
      ${rows.join("")}
    </table>
  `;
}

function renderChecklist(title: string | undefined, checklist: string[]): string {
  if (!title || checklist.length === 0) {
    return "";
  }

  return `
    <div style="background:#fff7eb; border:1px solid #ffd6a2; border-radius:16px; padding:20px; margin:0 0 24px;">
      <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#c76a00; font-weight:700;">
        ${escapeHtml(title)}
      </div>
      <ol style="margin:14px 0 0; padding-left:20px; color:#6b4b17; line-height:1.8;">
        ${checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </div>
  `;
}

function renderSpotlight(title: string | undefined, body: string | undefined): string {
  if (!title || !body) {
    return "";
  }

  return `
    <div style="background:#122846; border-radius:18px; padding:22px; color:#eef4fb; margin:0 0 24px;">
      <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#7dd3fc; font-weight:700;">
        ${escapeHtml(title)}
      </div>
      <div style="margin-top:10px; font-size:15px; line-height:1.8; color:#dce9f6;">
        ${escapeHtml(body)}
      </div>
    </div>
  `;
}

export function renderBrandEmail(input: BrandEmailInput): string {
  const introMarkup = input.introParagraphs
    .map(
      (paragraph) => `
        <p style="margin:0 0 16px; font-size:15px; line-height:1.8; color:#334155;">
          ${escapeHtml(paragraph)}
        </p>
      `,
    )
    .join("");

  return `
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
      ${escapeHtml(input.preheader ?? input.subtitle)}
    </div>
    <div style="font-family:Arial, sans-serif; background:#eef5fb; padding:36px 16px; color:#172033;">
      <div style="max-width:700px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #d7e3f0; box-shadow:0 18px 40px rgba(18,40,70,0.08);">
        <div style="height:8px; background:linear-gradient(90deg, #2a7b9b 0%, #57c5c7 52%, #ff9d00 100%);"></div>
        <div style="background:#183b5b; padding:30px 34px; display:flex; justify-content:space-between; align-items:flex-start; gap:18px;">
          <div style="max-width:430px;">
            <div style="display:inline-block; padding:8px 12px; border-radius:999px; background:rgba(255,255,255,0.12); color:#cbe8f6; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; font-weight:700;">
              ${escapeHtml(input.eyebrow)}
            </div>
            <div style="margin-top:16px; font-size:34px; line-height:1.08; font-weight:700; color:#ffffff;">
              ${escapeHtml(input.title)}
            </div>
            <div style="margin-top:10px; font-size:15px; line-height:1.7; color:#d4e6f2;">
              ${escapeHtml(input.subtitle)}
            </div>
          </div>
          <img src="${GCS_LOGO_URL}" alt="Global Creative Services" style="max-width:176px; height:auto; display:block;" />
        </div>
        <div style="padding:34px;">
          <div style="font-size:17px; font-weight:700; color:#172033; margin:0 0 18px;">
            Hi ${escapeHtml(input.recipientName)},
          </div>
          ${introMarkup}
          ${renderHighlights(input.highlights ?? [])}
          ${renderChecklist(input.checklistTitle, input.checklist ?? [])}
          ${renderSpotlight(input.spotlightTitle, input.spotlightBody)}
          <div style="background:#122846; color:#eef4fb; border-radius:18px; padding:22px;">
            <div style="font-size:18px; font-weight:700; margin-bottom:12px;">Contact Details</div>
            <div style="font-size:14px; line-height:1.8; color:#dce9f6;">
              <div><strong>Email:</strong> ${escapeHtml(companyContact.email)}</div>
              <div><strong>Phone:</strong> ${escapeHtml(companyContact.phone)}</div>
              <div><strong>Head Office:</strong> ${escapeHtml(companyContact.headOffice)}</div>
              <div><strong>Operational Office:</strong> ${escapeHtml(companyContact.operationalOffice)}</div>
            </div>
          </div>
          <div style="margin-top:18px; font-size:12px; line-height:1.8; color:#6b7280;">
            ${escapeHtml(input.footerNote ?? "This communication was issued by the Global Creative Services HR CRM workflow.")}
          </div>
        </div>
      </div>
    </div>
  `;
}


import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "https://esm.sh/pdf-lib@1.17.1";

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

async function sendEmailWithAttachment(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  fileName: string;
  pdfBytes: Uint8Array;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      attachments: [
        {
          filename: input.fileName,
          content: toBase64(input.pdfBytes),
          content_type: "application/pdf",
        },
      ],
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error?.message === "string"
          ? payload.error.message
          : `Resend request failed with status ${response.status}.`;
    throw new Error(message);
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
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !resendApiKey) {
    return jsonResponse(500, { error: "Supabase or Resend environment is not configured." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse(401, { error: "Missing authorization header." });
  }

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse(401, { error: "Unauthorized request." });
  }

  const { data: isAdmin, error: adminCheckError } = await callerClient.rpc("is_admin");
  if (adminCheckError || !isAdmin) {
    return jsonResponse(403, { error: "Only admins can send payslips." });
  }

  const payload = (await request.json()) as PayslipRequest;
  if (!payload.payrollRecordId) {
    return jsonResponse(400, { error: "payrollRecordId is required." });
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
    return jsonResponse(200, { status: "failed", message: payrollError.message, fileName: null });
  }

  if (!payroll) {
    return jsonResponse(200, { status: "skipped", message: "Payroll record not found.", fileName: null });
  }

  const payrollRow = payroll as PayrollRow;
  if (payrollRow.status !== "processed") {
    return jsonResponse(200, {
      status: "skipped",
      message: "Payslips are only sent for processed payroll records.",
      fileName: null,
    });
  }

  let employeeQuery = adminClient.from("employees").select("id, name, email, role, location, join_date");
  if (payrollRow.employee_id) {
    employeeQuery = employeeQuery.eq("id", payrollRow.employee_id);
  } else {
    employeeQuery = employeeQuery.eq("name", payrollRow.employee_name);
  }

  const { data: employee, error: employeeError } = await employeeQuery.maybeSingle();
  if (employeeError) {
    return jsonResponse(200, { status: "failed", message: employeeError.message, fileName: null });
  }

  if (!employee) {
    return jsonResponse(200, {
      status: "skipped",
      message: "Linked employee profile not found for this payroll record.",
      fileName: null,
    });
  }

  const employeeRow = employee as EmployeeRow;
  if (!employeeRow.email) {
    return jsonResponse(200, { status: "skipped", message: "Employee email is missing.", fileName: null });
  }

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

    await sendEmailWithAttachment({
      apiKey: resendApiKey,
      from: resendFromEmail,
      to: employeeRow.email,
      subject: `${companyName} - Salary Slip ${payrollRow.month}`,
      html: renderBrandEmail({
        preheader: `Salary slip for ${payrollRow.month}`,
        eyebrow: "Payroll",
        title: `Your ${payrollRow.month} salary slip`,
        subtitle: "Attached with a breakdown of compensation, deductions, and net pay",
        recipientName: employeeRow.name,
        introParagraphs: [
          `Your salary slip for ${payrollRow.month} is attached to this email.`,
          "Please review the compensation details and retain the document for your records. If you notice a discrepancy, contact HR or payroll support promptly.",
        ],
        highlights: [
          { label: "Department", value: payrollRow.department },
          { label: "Net Pay", value: formatMoney(payrollRow.net_pay) },
          { label: "Bonus", value: formatMoney(payrollRow.bonus) },
          { label: "Deductions", value: formatMoney(payrollRow.deductions) },
        ],
        checklistTitle: "Quick review checklist",
        checklist: [
          "Confirm your department and payroll month are correct.",
          "Review base salary, bonus, deductions, and net pay.",
          "Contact payroll support if any field appears incorrect.",
        ],
        spotlightTitle: "Payroll note",
        spotlightBody:
          "Your attached PDF also includes the employee details stored in the HR CRM, including private payroll information used during salary processing.",
        footerNote:
          "This payslip was generated by the HR CRM payroll workflow and should be stored securely for future reference.",
      }),
      fileName,
      pdfBytes,
    });

    const { error: updateError } = await adminClient
      .from("payroll_records")
      .update({
        payslip_sent_at: new Date().toISOString(),
        payslip_file_name: fileName,
      })
      .eq("id", payrollRow.id);

    if (updateError) {
      return jsonResponse(200, { status: "failed", message: updateError.message, fileName });
    }

    return jsonResponse(200, {
      status: "sent",
      message: `Salary slip emailed to ${employeeRow.email}.`,
      fileName,
    });
  } catch (error) {
    return jsonResponse(200, {
      status: "failed",
      message: error instanceof Error ? error.message : "Unable to send payslip.",
      fileName,
    });
  }
});

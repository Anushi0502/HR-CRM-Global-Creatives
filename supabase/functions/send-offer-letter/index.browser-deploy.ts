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

interface OfferLetterRequest {
  candidateId: string;
}

interface CandidateRow {
  id: string;
  name: string;
  email: string | null;
  role: string;
  source: string;
  stage: string;
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

async function createOfferLetterPdf(candidate: CandidateRow, companyName: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const width = page.getWidth();
  const logo = await fetchLogo(pdf);

  page.drawRectangle({ x: 0, y: 748, width, height: 94, color: rgb(0.16, 0.48, 0.61) });
  page.drawText(companyName, { x: 44, y: 804, size: 24, font: titleFont, color: rgb(1, 1, 1) });
  page.drawText("Offer Letter", { x: 44, y: 784, size: 12, font: bodyFont, color: rgb(0.89, 0.96, 0.98) });
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

  const issueDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  page.drawText(`Date: ${issueDate}`, { x: 44, y: 720, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Candidate: ${candidate.name}`, { x: 44, y: 700, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Role: ${candidate.role}`, { x: 44, y: 680, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Source: ${candidate.source}`, { x: 320, y: 720, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(`Stage: ${candidate.stage}`, { x: 320, y: 700, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });

  let cursorY = 640;
  cursorY = drawWrappedText(page, `Dear ${candidate.name},`, {
    x: 44,
    y: cursorY,
    maxWidth: 506,
    font: bodyFont,
    size: 12,
    lineHeight: 18,
  });
  cursorY -= 8;
  cursorY = drawWrappedText(
    page,
    `We are pleased to extend a provisional offer of employment for the position of ${candidate.role} at ${companyName}. This letter confirms our intent to move forward with your hiring process based on your performance throughout the evaluation stages.`,
    {
      x: 44,
      y: cursorY,
      maxWidth: 506,
      font: bodyFont,
      size: 12,
      lineHeight: 18,
    },
  );
  cursorY -= 8;
  cursorY = drawWrappedText(
    page,
    `Your profile entered our recruitment pipeline through ${candidate.source}. Detailed compensation, reporting structure, joining date, and onboarding documentation will be shared during the final joining formalities and internal approval stage.`,
    {
      x: 44,
      y: cursorY,
      maxWidth: 506,
      font: bodyFont,
      size: 12,
      lineHeight: 18,
    },
  );
  cursorY -= 8;
  drawWrappedText(
    page,
    `Please review the attached offer letter and reply to the HR team if you require clarification. Once you confirm your acceptance, our team will proceed with the employee creation, onboarding access, and document verification workflow.`,
    {
      x: 44,
      y: cursorY,
      maxWidth: 506,
      font: bodyFont,
      size: 12,
      lineHeight: 18,
    },
  );

  page.drawRectangle({ x: 44, y: 330, width: 506, height: 98, color: rgb(0.95, 0.98, 0.99) });
  page.drawText("Next Steps", { x: 60, y: 400, size: 14, font: titleFont, color: rgb(0.16, 0.48, 0.61) });
  drawWrappedText(page, "1. Reply to confirm acceptance of the role and intent to join.", {
    x: 60,
    y: 378,
    maxWidth: 470,
    font: bodyFont,
    size: 11,
    lineHeight: 15,
  });
  drawWrappedText(page, "2. Watch for onboarding communication covering documents, payroll setup, and account activation.", {
    x: 60,
    y: 357,
    maxWidth: 470,
    font: bodyFont,
    size: 11,
    lineHeight: 15,
  });
  drawWrappedText(page, "3. Reach out to HR if you need changes or have questions before final confirmation.", {
    x: 60,
    y: 336,
    maxWidth: 470,
    font: bodyFont,
    size: 11,
    lineHeight: 15,
  });

  page.drawLine({ start: { x: 44, y: 292 }, end: { x: 210, y: 292 }, thickness: 1, color: rgb(0.76, 0.82, 0.88) });
  page.drawText("Authorized by HR Operations", { x: 44, y: 272, size: 11, font: bodyFont, color: rgb(0.12, 0.16, 0.24) });
  page.drawText(companyName, { x: 44, y: 256, size: 11, font: titleFont, color: rgb(0.16, 0.48, 0.61) });

  page.drawRectangle({ x: 40, y: 72, width: 515, height: 150, color: rgb(0.1, 0.18, 0.29) });
  page.drawText("Contact Details", { x: 56, y: 194, size: 15, font: titleFont, color: rgb(1, 1, 1) });
  let contactY = drawWrappedText(page, `Email: ${companyContact.email}`, {
    x: 56,
    y: 168,
    maxWidth: 220,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });
  contactY = drawWrappedText(page, `Phone: ${companyContact.phone}`, {
    x: 56,
    y: contactY - 4,
    maxWidth: 220,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });
  drawWrappedText(page, `Head Office: ${companyContact.headOffice}`, {
    x: 56,
    y: contactY - 4,
    maxWidth: 220,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });

  page.drawText("Operational Office", { x: 316, y: 194, size: 15, font: titleFont, color: rgb(1, 1, 1) });
  drawWrappedText(page, companyContact.operationalOffice, {
    x: 316,
    y: 168,
    maxWidth: 210,
    font: bodyFont,
    size: 10,
    lineHeight: 14,
    color: rgb(0.95, 0.97, 1),
  });

  return pdf.save();
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
    return jsonResponse(403, { error: "Only admins can send offer letters." });
  }

  const payload = (await request.json()) as OfferLetterRequest;
  if (!payload.candidateId) {
    return jsonResponse(400, { error: "candidateId is required." });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: candidate, error: candidateError } = await adminClient
    .from("candidates")
    .select("id, name, email, role, source, stage")
    .eq("id", payload.candidateId)
    .maybeSingle();

  if (candidateError) {
    return jsonResponse(200, { status: "failed", message: candidateError.message, fileName: null });
  }

  if (!candidate) {
    return jsonResponse(200, { status: "skipped", message: "Candidate not found.", fileName: null });
  }

  const candidateRow = candidate as CandidateRow;
  if (!candidateRow.email) {
    return jsonResponse(200, { status: "skipped", message: "Candidate email is missing.", fileName: null });
  }

  if (!["offer", "hired"].includes(candidateRow.stage)) {
    return jsonResponse(200, {
      status: "skipped",
      message: "Offer letters are only sent for offer or hired candidates.",
      fileName: null,
    });
  }

  const { data: settings } = await adminClient.from("crm_settings").select("company_name").limit(1).maybeSingle();
  const companyName = typeof settings?.company_name === "string" ? settings.company_name : "Global Creative Services";
  const fileName = `offer-letter-${sanitizeFilePart(candidateRow.name)}-${sanitizeFilePart(candidateRow.role)}.pdf`;

  try {
    const pdfBytes = await createOfferLetterPdf(candidateRow, companyName);
    await sendEmailWithAttachment({
      apiKey: resendApiKey,
      from: resendFromEmail,
      to: candidateRow.email,
      subject: `${companyName} - Offer Letter for ${candidateRow.role}`,
      html: renderBrandEmail({
        preheader: `Offer letter for ${candidateRow.role}`,
        eyebrow: "Offer Letter",
        title: `Welcome to ${companyName}`,
        subtitle: `Your offer package for the ${candidateRow.role} position is attached`,
        recipientName: candidateRow.name,
        introParagraphs: [
          `We are pleased to share your offer letter for the role of ${candidateRow.role}.`,
          `Your profile reached this stage through our ${candidateRow.source} hiring channel, and the attached document confirms our intent to move forward with final onboarding.`,
        ],
        highlights: [
          { label: "Role", value: candidateRow.role },
          { label: "Recruitment Stage", value: candidateRow.stage },
        ],
        checklistTitle: "What happens next",
        checklist: [
          "Review the attached offer letter carefully.",
          "Reply to confirm acceptance or share clarifications.",
          "Watch for onboarding, payroll setup, and joining instructions from the HR team.",
        ],
        spotlightTitle: "Hiring handoff",
        spotlightBody:
          "After you confirm acceptance, the HR team will complete employee profile creation, account access, document verification, and your onboarding workflow.",
        footerNote:
          "If anything in the offer letter needs clarification, reply to the HR team before confirming acceptance.",
      }),
      fileName,
      pdfBytes,
    });

    const { error: updateError } = await adminClient
      .from("candidates")
      .update({
        offer_letter_sent_at: new Date().toISOString(),
        offer_letter_file_name: fileName,
      })
      .eq("id", candidateRow.id);

    if (updateError) {
      return jsonResponse(200, { status: "failed", message: updateError.message, fileName });
    }

    return jsonResponse(200, {
      status: "sent",
      message: `Offer letter emailed to ${candidateRow.email}.`,
      fileName,
    });
  } catch (error) {
    return jsonResponse(200, {
      status: "failed",
      message: error instanceof Error ? error.message : "Unable to send offer letter.",
      fileName,
    });
  }
});

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

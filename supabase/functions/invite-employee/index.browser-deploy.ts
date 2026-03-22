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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

interface InviteEmployeeRequest {
  employeeId: string;
  email: string;
  fullName: string;
  role: string;
  redirectTo?: string;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function isExistingUserError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("already been registered") || normalized.includes("already registered");
}

async function sendBrandedInviteEmail(input: {
  apiKey: string;
  from: string;
  to: string;
  fullName: string;
  role: string;
  inviteSent: boolean;
}) {
  const subject = input.inviteSent
    ? "Global Creative Services - Your HR CRM access is ready"
    : "Global Creative Services - Your employee profile is ready";
  const intro = input.inviteSent
    ? "A secure HR CRM invite has been issued for your account. Please check your inbox for the Supabase sign-in invitation and complete the setup from that email."
    : "Your employee profile has been linked to your existing HR CRM account. You can sign in using your current credentials.";
  const actionItems = input.inviteSent
    ? [
        "Open the invitation email sent to this address.",
        "Set your password and complete your first login.",
        "Update PAN, address, mobile, and bank details after login.",
      ]
    : [
        "Sign in with your existing credentials.",
        "Review your employee profile and first-login setup prompts.",
        "Update PAN, address, mobile, and bank details after login.",
      ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject,
      html: renderBrandEmail({
        preheader: subject,
        eyebrow: "Employee Access",
        title: "Your HR CRM profile is ready",
        subtitle: "Global Creative Services employee onboarding and account access",
        recipientName: input.fullName,
        introParagraphs: [intro],
        highlights: [
          { label: "Employee Role", value: input.role },
          { label: "Access Status", value: input.inviteSent ? "Invite sent" : "Existing account linked" },
        ],
        checklistTitle: "Next steps",
        checklist: actionItems,
        spotlightTitle: "Support note",
        spotlightBody:
          "Keep your first-login setup moving by updating PAN, address, mobile number, bank name, and account number as soon as you enter the HR CRM workspace.",
        footerNote:
          "If you do not see the system-generated access email, check spam or promotions and contact HR support for help.",
      }),
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

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, { error: "Supabase function environment is not configured." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse(401, { error: "Missing authorization header." });
  }

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
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
    return jsonResponse(403, { error: "Only admins can invite employees." });
  }

  const payload = (await request.json()) as InviteEmployeeRequest;
  if (!payload.employeeId || !payload.email || !payload.fullName) {
    return jsonResponse(400, { error: "employeeId, email, and fullName are required." });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const linkEmployeeToUser = async (userId: string | null | undefined) => {
    if (!userId) {
      return;
    }

    const { error } = await adminClient
      .from("employees")
      .update({ user_id: userId })
      .eq("id", payload.employeeId)
      .is("user_id", null);

    if (error) {
      throw new Error(`Unable to link employee profile: ${error.message}`);
    }
  };

  const invite = await adminClient.auth.admin.inviteUserByEmail(payload.email, {
    data: {
      full_name: payload.fullName,
      role: "employee",
      employee_role: payload.role,
    },
    redirectTo: payload.redirectTo,
  });

  if (!invite.error) {
    await linkEmployeeToUser(invite.data.user?.id);
    if (resendApiKey) {
      try {
        await sendBrandedInviteEmail({
          apiKey: resendApiKey,
          from: resendFromEmail,
          to: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          inviteSent: true,
        });
      } catch (error) {
        console.error("Branded invite email failed:", error);
      }
    }
    return jsonResponse(200, {
      status: "sent",
      message: `Invite email sent to ${payload.email}.`,
      userId: invite.data.user?.id ?? null,
    });
  }

  if (isExistingUserError(invite.error.message)) {
    const { data: listedUsers, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return jsonResponse(500, { error: `Unable to inspect existing users: ${listError.message}` });
    }

    const existingUser = listedUsers.users.find(
      (listedUser) => listedUser.email?.toLowerCase() === payload.email.toLowerCase(),
    );

    await linkEmployeeToUser(existingUser?.id);
    if (resendApiKey) {
      try {
        await sendBrandedInviteEmail({
          apiKey: resendApiKey,
          from: resendFromEmail,
          to: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          inviteSent: false,
        });
      } catch (error) {
        console.error("Branded existing-user email failed:", error);
      }
    }

    return jsonResponse(200, {
      status: "existing_user",
      message: existingUser?.id
        ? `${payload.email} already has an account. The employee profile has been linked to it.`
        : `${payload.email} already has an account, so no new invite email was sent.`,
      userId: existingUser?.id ?? null,
    });
  }

  return jsonResponse(500, { error: invite.error.message });
});

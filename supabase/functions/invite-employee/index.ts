import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderBrandEmail } from "../_shared/brandEmail.ts";

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

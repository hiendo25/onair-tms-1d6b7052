import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, name, employeeId, orgId, role = "student" } = await req.json();
    if (!email || !employeeId || !orgId) throw new Error("email, employeeId, orgId required");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Invite user via Supabase Auth (sends email with magic link)
    const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, org_id: orgId },
      redirectTo: `${Deno.env.get("SITE_URL") ?? "http://localhost:8080"}/auth/callback`,
    });

    if (inviteErr) throw inviteErr;
    const userId = invited.user.id;

    // Link user_id back to employee
    const { error: empErr } = await supabase
      .from("employees")
      .update({ user_id: userId })
      .eq("id", employeeId);
    if (empErr) throw empErr;

    // Create profile
    await supabase.from("profiles").upsert({
      id: userId,
      full_name: name,
      email,
    }, { onConflict: "id" });

    // Assign role in user_roles
    await supabase.from("user_roles").upsert({
      user_id: userId,
      org_id: orgId,
      role: role === "admin" ? "admin" : "student",
    }, { onConflict: "user_id,org_id" });

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("invite-employee error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient, createSVClient } from "@/services";

import { SubscribePushSubscriptionPayload } from "./type";

export async function subscribeUser(payload: SubscribePushSubscriptionPayload) {
  const supabase = await createSVClient();
  return await supabase.from("push_subscriptions").insert(payload).select().single();
}

export async function unsubscribeUser(endpoint: string) {
  const supabase = await createSVClient();
  return await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).select("id");
}

export async function getSubscriptionsByOrganizationId(organizationId: string) {
  const supabase = await createSVClient();
  return await supabase.from("push_subscriptions").select("*").eq("organization_id", organizationId);
}

export async function getSubscribeNotification(employeeId: string) {
  const supabase = await createClient();
  return await supabase.from("push_subscriptions").select("*").eq("employee_id", employeeId).limit(1).maybeSingle();
}

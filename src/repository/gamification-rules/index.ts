import { createSVClient } from "@/services";
import type { Database } from "@/types/supabase.types";

type GamificationRule = Database["public"]["Tables"]["gamification_rules"]["Row"];
type GamificationRuleInsert = Database["public"]["Tables"]["gamification_rules"]["Insert"];
type RuleTriggerType = Database["public"]["Enums"]["rule_trigger_type"];

export interface GamificationRuleWithDefault extends Omit<GamificationRule, "id" | "created_at" | "updated_at"> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  is_default?: boolean;
}

/**
 * Get gamification rules for an organization
 */
export async function getGamificationRules(organizationId: string): Promise<GamificationRule[]> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("gamification_rules")
    .select("*")
    .eq("organization_id", organizationId)
    .order("priority", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch gamification rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific gamification rule by trigger type
 */
export async function getGamificationRuleByTrigger(
  organizationId: string,
  triggerType: RuleTriggerType
): Promise<GamificationRule | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("gamification_rules")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("trigger_type", triggerType)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch gamification rule: ${error.message}`);
  }

  return data;
}

/**
 * Create a new gamification rule
 */
export async function createGamificationRule(rule: GamificationRuleInsert): Promise<GamificationRule> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("gamification_rules")
    .insert(rule)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create gamification rule: ${error.message}`);
  }

  return data;
}

/**
 * Update a gamification rule
 */
export async function updateGamificationRule(
  id: string,
  updates: Partial<GamificationRuleInsert>
): Promise<GamificationRule> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("gamification_rules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update gamification rule: ${error.message}`);
  }

  return data;
}

/**
 * Toggle is_active status of a rule
 */
export async function toggleGamificationRule(id: string, isActive: boolean): Promise<GamificationRule> {
  return updateGamificationRule(id, { is_active: isActive });
}

/**
 * Delete a gamification rule
 */
export async function deleteGamificationRule(id: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("gamification_rules")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete gamification rule: ${error.message}`);
  }
}

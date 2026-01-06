import { createSVClient } from "@/services/supabase/server";

/**
 * Get employee's XP balance and current level
 */
export async function getEmployeeXpAndLevel(
  employeeId: string,
  organizationId: string
) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_xp_balances")
    .select(`
      total_xp,
      level_id,
      currentLevel:levels!employee_xp_balances_level_id_fkey(
        id,
        title,
        description,
        icon,
        score_required
      )
    `)
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch employee XP and level: ${error.message}`);
  }

  return data;
}

/**
 * Get next level for an employee based on their current level and organization
 */
export async function getNextLevel(
  organizationId: string,
  currentScoreRequired: number | null
) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("levels")
    .select("id, title, description, icon, score_required")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .gt("score_required", currentScoreRequired || 0)
    .order("score_required", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch next level: ${error.message}`);
  }

  return data;
}

/**
 * Get the first (lowest) level for an organization
 * Used when employee has no level yet
 */
export async function getFirstLevel(organizationId: string) {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("levels")
    .select("id, title, description, icon, score_required")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("score_required", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch first level: ${error.message}`);
  }

  return data;
}

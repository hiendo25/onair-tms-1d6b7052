import { createSVClient } from "@/services";
import type { Database } from "@/types/supabase.types";

type XPTransaction = Database["public"]["Tables"]["employee_xp_transactions"]["Row"];
type XPTransactionInsert = Database["public"]["Tables"]["employee_xp_transactions"]["Insert"];
type XPBalance = Database["public"]["Tables"]["employee_xp_balances"]["Row"];

/**
 * Create an XP transaction
 */
export async function createXpTransaction(
  transaction: XPTransactionInsert
): Promise<XPTransaction> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_xp_transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create XP transaction: ${error.message}`);
  }

  return data;
}

/**
 * Get XP balance for an employee
 */
export async function getEmployeeXpBalance(
  employeeId: string,
  organizationId: string
): Promise<XPBalance | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_xp_balances")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch XP balance: ${error.message}`);
  }

  return data;
}

/**
 * Get XP transactions for an employee with pagination
 */
export async function getEmployeeXpTransactions(
  employeeId: string,
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ transactions: XPTransaction[]; total: number }> {
  const supabase = await createSVClient();
  const { limit = 10, offset = 0 } = options || {};

  const { data, error, count } = await supabase
    .from("employee_xp_transactions")
    .select("*", { count: "exact" })
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch XP transactions: ${error.message}`);
  }

  return {
    transactions: data || [],
    total: count || 0,
  };
}

/**
 * Count XP transactions for an employee within a time range
 */
export async function countXpTransactionsByRule(
  employeeId: string,
  organizationId: string,
  ruleId: string,
  startDate?: Date
): Promise<number> {
  const supabase = await createSVClient();

  let query = supabase
    .from("employee_xp_transactions")
    .select("*", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .eq("rule_id", ruleId);

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count XP transactions: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get XP transactions with rule information (for history display)
 */
export async function getEmployeeXpTransactionsWithRules(
  employeeId: string,
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  transactions: Array<
    XPTransaction & {
      rule_name?: string;
    }
  >;
  total: number;
}> {
  const supabase = await createSVClient();
  const { limit = 10, offset = 0 } = options || {};

  const { data, error, count } = await supabase
    .from("employee_xp_transactions")
    .select(
      `
      *,
      gamification_rules (
        rule_name
      )
    `,
      { count: "exact" }
    )
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch XP transactions with rules: ${error.message}`);
  }

  const transactions = (data || []).map((item: any) => ({
    ...item,
    rule_name: item.gamification_rules?.rule_name,
    gamification_rules: undefined, // Remove nested object
  }));

  return {
    transactions,
    total: count || 0,
  };
}

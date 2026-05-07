import type { TargetTriggerType } from "@/constants/gamification-rules.constant";
import { gamificationRulesRepository, xpTransactionsRepository } from "@/repository";
import type { Database } from "@/types/supabase.types";

type XPTransactionInsert = Database["public"]["Tables"]["employee_xp_transactions"]["Insert"];

interface AwardXpInput {
  employeeId: string;
  organizationId: string;
  triggerType: TargetTriggerType;
  metadata?: {
    entity_id?: string;
    entity_type?: string;
    progress_percentage?: number;
    [key: string]: any;
  };
}

interface AwardXpResult {
  success: boolean;
  message: string;
  xpAwarded?: number;
  transaction?: {
    id: string;
    xp_amount: number;
  };
}

/**
 * Award XP to an employee based on a trigger event
 * Checks if rule is active, validates conditions, and creates transaction
 */
export async function awardXp(input: AwardXpInput): Promise<AwardXpResult> {
  try {
    const { employeeId, organizationId, triggerType, metadata = {} } = input;

    // Get the rule for this trigger type
    const rule = await gamificationRulesRepository.getGamificationRuleByTrigger(
      organizationId,
      triggerType
    );

    // If rule doesn't exist or is not active, don't award XP
    if (!rule) {
      return {
        success: false,
        message: `No rule found for trigger type: ${triggerType}`,
      };
    }

    if (!rule.is_active) {
      return {
        success: false,
        message: `Rule for ${triggerType} is not active`,
      };
    }

    // Validate conditions (e.g., min_progress_percentage)
    if (rule.conditions && typeof rule.conditions === "object") {
      const conditions = rule.conditions as Record<string, any>;

      // Check min_progress_percentage if specified
      if (
        conditions.min_progress_percentage &&
        metadata.progress_percentage !== undefined
      ) {
        if (metadata.progress_percentage < conditions.min_progress_percentage) {
          return {
            success: false,
            message: `Progress percentage (${metadata.progress_percentage}%) is below minimum required (${conditions.min_progress_percentage}%)`,
          };
        }
      }
    }

    // Check rate limits if specified
    const now = new Date();

    // Check max_times_per_day
    if (rule.max_times_per_day !== null && rule.max_times_per_day > 0) {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const count = await xpTransactionsRepository.countXpTransactionsByRule(
        employeeId,
        organizationId,
        rule.id,
        startOfDay
      );

      if (count >= rule.max_times_per_day) {
        return {
          success: false,
          message: `Daily limit reached for ${triggerType}`,
        };
      }
    }

    // Check max_times_per_week
    if (rule.max_times_per_week !== null && rule.max_times_per_week > 0) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const count = await xpTransactionsRepository.countXpTransactionsByRule(
        employeeId,
        organizationId,
        rule.id,
        startOfWeek
      );

      if (count >= rule.max_times_per_week) {
        return {
          success: false,
          message: `Weekly limit reached for ${triggerType}`,
        };
      }
    }

    // Check max_times_total
    if (rule.max_times_total !== null && rule.max_times_total > 0) {
      const count = await xpTransactionsRepository.countXpTransactionsByRule(
        employeeId,
        organizationId,
        rule.id
      );

      if (count >= rule.max_times_total) {
        return {
          success: false,
          message: `Total limit reached for ${triggerType}`,
        };
      }
    }

    // Create XP transaction
    const transaction: XPTransactionInsert = {
      employee_id: employeeId,
      organization_id: organizationId,
      rule_id: rule.id,
      trigger_type: triggerType,
      xp_amount: rule.xp_amount,
      metadata: metadata as any,
    };

    const data = await xpTransactionsRepository.createXpTransaction(transaction);

    // The employee_xp_balances table will be auto-updated by database trigger
    return {
      success: true,
      message: `Successfully awarded ${rule.xp_amount} XP for ${triggerType}`,
      xpAwarded: rule.xp_amount,
      transaction: {
        id: data.id,
        xp_amount: data.xp_amount,
      },
    };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to award XP",
    };
  }
}

/**
 * Get XP balance for an employee
 */
export async function getEmployeeXpBalance(
  employeeId: string,
  organizationId: string
): Promise<{
  total_xp: number;
  current_level: number;
} | null> {
  try {
    const data = await xpTransactionsRepository.getEmployeeXpBalance(employeeId, organizationId);

    if (!data) {
      // No balance record yet, return zeros
      return {
        total_xp: 0,
        current_level: 1,
      };
    }

    return {
      total_xp: data.total_xp,
      current_level: data.current_level,
    };
  } catch (error) {
    console.error("Error getting employee XP balance:", error);
    return null;
  }
}

/**
 * Get XP transaction history for an employee
 */
export async function getEmployeeXpTransactions(
  employeeId: string,
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  transactions: Array<{
    id: string;
    trigger_type: string;
    xp_amount: number;
    metadata: any;
    created_at: string;
    rule_name?: string;
  }>;
  total: number;
}> {
  try {
    const { transactions, total } = await xpTransactionsRepository.getEmployeeXpTransactionsWithRules(
      employeeId,
      organizationId,
      options
    );

    return {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        trigger_type: tx.trigger_type,
        xp_amount: tx.xp_amount,
        metadata: tx.metadata,
        created_at: tx.created_at,
        rule_name: tx.rule_name,
      })),
      total,
    };
  } catch (error) {
    console.error("Error getting employee XP transactions:", error);
    return { transactions: [], total: 0 };
  }
}

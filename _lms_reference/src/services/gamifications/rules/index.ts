import {
  DEFAULT_GAMIFICATION_RULES,
  TARGET_TRIGGER_TYPES,
  type TargetTriggerType,
} from "@/constants/gamification-rules.constant";
import { gamificationRulesRepository } from "@/repository";
import type { GamificationRuleWithDefault } from "@/repository/gamification-rules";
import type { Database } from "@/types/supabase.types";

type GamificationRule = Database["public"]["Tables"]["gamification_rules"]["Row"];

interface GetRulesForOrganizationResult {
  success: boolean;
  data: GamificationRuleWithDefault[];
}

interface ToggleRuleResult {
  success: boolean;
  message: string;
  data: GamificationRule;
  action: "toggled" | "created";
}

/**
 * Get all gamification rules for an organization
 * Returns DB rules merged with defaults for missing rules
 */
export async function getRulesForOrganization(organizationId: string): Promise<GetRulesForOrganizationResult> {
  // Fetch all rules from database
  const dbRules = await gamificationRulesRepository.getGamificationRules(organizationId);

  // Create a map of existing rules by trigger_type
  const dbRulesMap = new Map(dbRules.map((rule) => [rule.trigger_type, rule]));

  // Prepare result with DB rules and defaults
  const result: GamificationRuleWithDefault[] = [];

  // Focus on target trigger types
  for (const triggerType of TARGET_TRIGGER_TYPES) {
    const dbRule = dbRulesMap.get(triggerType);

    if (dbRule) {
      // Rule exists in database
      result.push({
        ...dbRule,
        is_default: false,
      } as GamificationRuleWithDefault);
    } else {
      // Rule doesn't exist, use default
      const defaultRule = DEFAULT_GAMIFICATION_RULES[triggerType];
      result.push({
        rule_name: defaultRule.rule_name,
        trigger_type: defaultRule.trigger_type,
        xp_amount: defaultRule.xp_amount,
        conditions: defaultRule.conditions,
        is_active: defaultRule.is_active,
        priority: defaultRule.priority,
        organization_id: organizationId,
        max_times_per_day: null,
        max_times_per_week: null,
        max_times_total: null,
        is_default: true,
      });
    }
  }

  return {
    success: true,
    data: result,
  };
}

/**
 * Toggle a gamification rule's is_active status
 * If rule doesn't exist, create it with default values and set is_active to true
 */
export async function toggleRule(
  organizationId: string,
  triggerType: TargetTriggerType
): Promise<ToggleRuleResult> {
  // Check if rule already exists
  const existingRule = await gamificationRulesRepository.getGamificationRuleByTrigger(
    organizationId,
    triggerType
  );

  let result: GamificationRule;
  let action: "toggled" | "created";

  if (existingRule) {
    // Rule exists - toggle is_active
    const newIsActive = !existingRule.is_active;
    result = await gamificationRulesRepository.toggleGamificationRule(existingRule.id, newIsActive);
    action = "toggled";
  } else {
    // Rule doesn't exist - create with default values
    const defaultRule = DEFAULT_GAMIFICATION_RULES[triggerType];

    result = await gamificationRulesRepository.createGamificationRule({
      organization_id: organizationId,
      rule_name: defaultRule.rule_name,
      trigger_type: defaultRule.trigger_type,
      xp_amount: defaultRule.xp_amount,
      conditions: defaultRule.conditions,
      is_active: true, // Always create as active
      priority: defaultRule.priority,
    });
    action = "created";
  }

  const message =
    action === "toggled"
      ? `Rule ${result.is_active ? "activated" : "deactivated"} successfully`
      : "Rule created and activated successfully";

  return {
    success: true,
    message,
    data: result,
    action,
  };
}

interface SaveRuleInput {
  trigger_type: TargetTriggerType;
  xp_amount: number;
  is_active: boolean;
}

interface SaveRulesResult {
  success: boolean;
  message: string;
  savedCount: number;
}

/**
 * Save multiple gamification rules at once
 * Creates new rules or updates existing ones based on trigger_type
 */
export async function saveRules(
  organizationId: string,
  rulesToSave: SaveRuleInput[]
): Promise<SaveRulesResult> {
  try {
    let savedCount = 0;

    for (const ruleData of rulesToSave) {
      // Check if rule already exists
      const existingRule = await gamificationRulesRepository.getGamificationRuleByTrigger(
        organizationId,
        ruleData.trigger_type
      );

      if (existingRule) {
        // Update existing rule
        await gamificationRulesRepository.updateGamificationRule(existingRule.id, {
          xp_amount: ruleData.xp_amount,
          is_active: ruleData.is_active,
        });
        savedCount++;
      } else {
        // Create new rule with provided values
        const defaultRule = DEFAULT_GAMIFICATION_RULES[ruleData.trigger_type];

        await gamificationRulesRepository.createGamificationRule({
          organization_id: organizationId,
          rule_name: defaultRule.rule_name,
          trigger_type: ruleData.trigger_type,
          xp_amount: ruleData.xp_amount,
          conditions: defaultRule.conditions,
          is_active: ruleData.is_active,
          priority: defaultRule.priority,
        });
        savedCount++;
      }
    }

    return {
      success: true,
      message: `Đã lưu ${savedCount} quy tắc thành công`,
      savedCount,
    };
  } catch (error) {
    console.error("Error saving rules:", error);
    throw error;
  }
}

import type { Database } from "@/types/supabase.types";

type RuleTriggerType = Database["public"]["Enums"]["rule_trigger_type"];

export interface DefaultGamificationRule {
  rule_name: string;
  trigger_type: RuleTriggerType;
  xp_amount: number;
  conditions: {
    min_progress_percentage?: number;
    [key: string]: any;
  };
  is_active: boolean;
  priority: number;
}

/**
 * Target trigger types we're focusing on for gamification
 * Extracted from the Database enum to ensure type safety
 */
export const TARGET_TRIGGER_TYPES = [
  "course_completed",
  "class_completed",
  "phase_completed",
  "learning_path_completed",
] as const satisfies readonly RuleTriggerType[];

export type TargetTriggerType = (typeof TARGET_TRIGGER_TYPES)[number];

/**
 * Default gamification rules for course, phase, and learning path completion
 * These are used when no custom rules exist in the database
 */
export const DEFAULT_GAMIFICATION_RULES: Record<TargetTriggerType, DefaultGamificationRule> = {
  course_completed: {
    rule_name: "Complete Course (>80% Progress)",
    trigger_type: "course_completed" satisfies RuleTriggerType,
    xp_amount: 500,
    conditions: {
      min_progress_percentage: 80,
    },
    is_active: true,
    priority: 100,
  },
  class_completed: {
    rule_name: "Complete Class (>80% Progress)",
    trigger_type: "class_completed" satisfies RuleTriggerType,
    xp_amount: 400,
    conditions: {
      min_progress_percentage: 80,
    },
    is_active: true,
    priority: 100,
  },
  phase_completed: {
    rule_name: "Complete Phase (>80% Progress)",
    trigger_type: "phase_completed" satisfies RuleTriggerType,
    xp_amount: 300,
    conditions: {
      min_progress_percentage: 80,
    },
    is_active: true,
    priority: 100,
  },
  learning_path_completed: {
    rule_name: "Complete Learning Path (>80% Progress)",
    trigger_type: "learning_path_completed" satisfies RuleTriggerType,
    xp_amount: 2000,
    conditions: {
      min_progress_percentage: 80,
    },
    is_active: true,
    priority: 100,
  },
};

/**
 * Type guard to check if a trigger type is one of our target types
 */
export function isTargetTriggerType(
  triggerType: RuleTriggerType
): triggerType is TargetTriggerType {
  return TARGET_TRIGGER_TYPES.includes(triggerType as TargetTriggerType);
}

/**
 * Get default rule for a specific trigger type
 */
export function getDefaultRule(triggerType: TargetTriggerType): DefaultGamificationRule {
  return DEFAULT_GAMIFICATION_RULES[triggerType];
}

/**
 * Get all default rules as an array
 */
export function getAllDefaultRules(): DefaultGamificationRule[] {
  return Object.values(DEFAULT_GAMIFICATION_RULES);
}

import { gamificationXpRepository } from "@/repository";
import type { EmployeeGamificationXpResult, LevelInfo, NextLevelInfo } from "@/types/gamification.types";

/**
 * Get employee's gamification XP and level information
 * Includes current XP, current level, and progress to next level
 */
export async function getEmployeeGamificationXp(
  employeeId: string,
  organizationId: string
): Promise<EmployeeGamificationXpResult> {
  // Get employee's XP balance and current level
  const xpData = await gamificationXpRepository.getEmployeeXpAndLevel(
    employeeId,
    organizationId
  );

  const currentXp = xpData?.total_xp || 0;
  const currentLevelId = xpData?.level_id || null;
  let currentLevelData = xpData?.currentLevel as any;

  // If no level data from balance, find the appropriate level based on XP
  if (!currentLevelData) {
    currentLevelData = await gamificationXpRepository.getLevelByXp(
      organizationId,
      currentXp
    );
  }

  // Format current level
  const currentLevel: LevelInfo | null = currentLevelData
    ? {
        id: currentLevelData.id,
        title: currentLevelData.title,
        description: currentLevelData.description,
        icon: currentLevelData.icon,
        scoreRequired: currentLevelData.score_required,
      }
    : null;

  // Determine next level
  let nextLevel: NextLevelInfo | null = null;

  if (currentLevel) {
    // Employee has a level - get next level
    const nextLevelData = await gamificationXpRepository.getNextLevel(
      organizationId,
      currentLevel.scoreRequired
    );

    if (nextLevelData) {
      nextLevel = {
        id: nextLevelData.id,
        title: nextLevelData.title,
        description: nextLevelData.description,
        icon: nextLevelData.icon,
        scoreRequired: nextLevelData.score_required,
        xpNeeded: nextLevelData.score_required - currentXp,
      };
    }
  } else {
    // Employee has no level - get first level
    const firstLevelData = await gamificationXpRepository.getFirstLevel(organizationId);

    if (firstLevelData) {
      nextLevel = {
        id: firstLevelData.id,
        title: firstLevelData.title,
        description: firstLevelData.description,
        icon: firstLevelData.icon,
        scoreRequired: firstLevelData.score_required,
        xpNeeded: firstLevelData.score_required - currentXp,
      };
    }
  }

  return {
    currentXp,
    currentLevelId,
    currentLevel,
    nextLevel,
  };
}

/**
 * Utility for managing video playback positions in localStorage
 * Only used for learning paths to track user progress
 */

const STORAGE_KEY = 'learning_path_video_positions';

interface VideoPosition {
  lessonId: string;
  currentTime: number;
  duration: number;
  lastUpdated: number;
}

interface VideoPositionMap {
  [lessonId: string]: VideoPosition;
}

/**
 * Get all stored video positions
 */
const getAllPositions = (): VideoPositionMap => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading video positions from localStorage:', error);
    return {};
  }
};

/**
 * Save video position for a specific lesson
 * @param lessonId - The lesson ID
 * @param currentTime - Current playback time in seconds
 * @param duration - Total video duration in seconds
 */
export const saveVideoPosition = (
  lessonId: string,
  currentTime: number,
  duration: number,
): void => {
  try {
    const positions = getAllPositions();

    positions[lessonId] = {
      lessonId,
      currentTime,
      duration,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error('Error saving video position to localStorage:', error);
  }
};

/**
 * Get saved video position for a specific lesson
 * @param lessonId - The lesson ID
 * @returns The saved position or null if not found
 */
export const getVideoPosition = (lessonId: string): VideoPosition | null => {
  try {
    const positions = getAllPositions();
    return positions[lessonId] || null;
  } catch (error) {
    console.error('Error getting video position from localStorage:', error);
    return null;
  }
};

/**
 * Clear video position for a specific lesson (e.g., when video completes)
 * @param lessonId - The lesson ID
 */
export const clearVideoPosition = (lessonId: string): void => {
  try {
    const positions = getAllPositions();
    delete positions[lessonId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error('Error clearing video position from localStorage:', error);
  }
};

/**
 * Clear all stored video positions
 */
export const clearAllVideoPositions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all video positions from localStorage:', error);
  }
};

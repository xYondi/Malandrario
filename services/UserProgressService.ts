import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProgress {
  currentLevel: number;
  completedLevels: number[];
  gemsEarned: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  streakRecord: number;
}

const DEFAULT_PROGRESS: UserProgress = {
  currentLevel: 1,
  completedLevels: [],
  gemsEarned: 0,
  totalCorrectAnswers: 0,
  totalQuestions: 0,
  streakRecord: 0,
};

const STORAGE_KEY = '@malandrario_user_progress';

export class UserProgressService {
  /**
   * Obtiene el progreso actual del usuario
   */
  static async getUserProgress(): Promise<UserProgress> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PROGRESS, ...parsed };
      }
      return DEFAULT_PROGRESS;
    } catch (error) {
      console.error('Error loading user progress:', error);
      return DEFAULT_PROGRESS;
    }
  }

  /**
   * Guarda el progreso del usuario
   */
  static async saveUserProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  /**
   * Completa un nivel y actualiza el progreso
   */
  static async completeLevel(
    levelNumber: number,
    correctAnswers: number,
    totalQuestions: number,
    streakAchieved: number,
    gemsEarned: number
  ): Promise<UserProgress> {
    const currentProgress = await this.getUserProgress();
    
    const updatedProgress: UserProgress = {
      ...currentProgress,
      // Solo avanza al siguiente nivel si el nivel actual está completo
      currentLevel: levelNumber === currentProgress.currentLevel 
        ? Math.max(currentProgress.currentLevel, levelNumber + 1)
        : currentProgress.currentLevel,
      // Agrega el nivel a completados si no está ya
      completedLevels: currentProgress.completedLevels.includes(levelNumber)
        ? currentProgress.completedLevels
        : [...currentProgress.completedLevels, levelNumber].sort((a, b) => a - b),
      gemsEarned: currentProgress.gemsEarned + gemsEarned,
      totalCorrectAnswers: currentProgress.totalCorrectAnswers + correctAnswers,
      totalQuestions: currentProgress.totalQuestions + totalQuestions,
      streakRecord: Math.max(currentProgress.streakRecord, streakAchieved),
    };

    await this.saveUserProgress(updatedProgress);
    return updatedProgress;
  }

  /**
   * Obtiene el nivel máximo disponible para el usuario
   */
  static async getMaxAvailableLevel(): Promise<number> {
    const progress = await this.getUserProgress();
    return progress.currentLevel;
  }

  /**
   * Verifica si un nivel está desbloqueado
   */
  static async isLevelUnlocked(levelNumber: number): Promise<boolean> {
    const progress = await this.getUserProgress();
    return levelNumber <= progress.currentLevel;
  }

  /**
   * Verifica si un nivel está completado
   */
  static async isLevelCompleted(levelNumber: number): Promise<boolean> {
    const progress = await this.getUserProgress();
    return progress.completedLevels.includes(levelNumber);
  }

  /**
   * Resetea el progreso del usuario (para testing)
   */
  static async resetProgress(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Actualiza las gemas del usuario (para compras/recompensas)
   */
  static async updateGems(gemsToAdd: number): Promise<UserProgress> {
    const currentProgress = await this.getUserProgress();
    const updatedProgress: UserProgress = {
      ...currentProgress,
      gemsEarned: Math.max(0, currentProgress.gemsEarned + gemsToAdd),
    };
    
    await this.saveUserProgress(updatedProgress);
    return updatedProgress;
  }
}

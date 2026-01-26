export type Gender = "male" | "female" | "non-binary";

export type WeightUnit = "lbs" | "kg";

export type WaterUnit = "oz" | "ml";

export type ThemeOptions = "light" | "dark" | "retro";

export interface Appearance {
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  hairStyle: string; // ID of the hairstyle
  currentOutfit: string; // ID of the shirt/armor
  currentHat: string | null;
  currentAccessory: string | null; // Glasses, earrings, etc.
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface PlayerInventory {
  clothes: string[]; // Just IDs
  hairstyles: string[]; // Just IDs
  furniture: InventoryItem[]; // Tracks how many you own total
  homes: string[];
  accessories: string[];
}

export interface PlayerProfile {
  version: string;
  uid: string;
  displayName: string;
  isPremium: boolean;

  // RPG Progress
  level: number;
  xp: number;
  gold: number;
  currentStreak: number;
  title: string;
  achievements: string[];
  tutorialStep: number;

  // Customization
  gender: Gender;
  appearance: Appearance;

  // World State
  inventory: PlayerInventory;
  currentHome: string;
  homeLayout: {
    slots: Record<number, string>;
  };

  // Settings
  settings: {
    weightUnit: WeightUnit;
    waterUnit: WaterUnit;
    language: string;
    theme: ThemeOptions;
  };

  // The Science (Updated)
  stats: {
    age: number;
    height: number;
    startingWeight: number;
    targetWeight: number;
    weightHistory: WeightEntry[];
    totalWorkouts: number;
    totalWaterLogs: number;
    totalQuestsCompleted: number;
  };

  targetCalories: number;
  targetWater: number;
}
// The "Template" stored in your Food Library
export interface FoodDefinition {
  id: string;
  name: string;
  calories: number; // Base kcal per serving
  isLiquid: boolean;
  isFavorite: boolean;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// The "Instance" stored in your Daily Log array
export interface FoodLogEntry extends FoodDefinition {
  timestamp: string;
  multiplier: number; // Required: how many servings
  totalCalories: number; // Required: result of calories * multiplier
}

export interface ExerciseEntry {
  id: string;
  name: string;
  duration: number;
  timestamp: string;
}

export interface WaterEntry {
  id: string;
  amount: number;
  timestamp: string;
}

export interface DailyLog {
  date: string;
  totalCalories: number;
  totalWater: number;
  totalExerciseMinutes: number;
  isArchived: boolean;
  foods?: FoodLogEntry[];
  exercises?: ExerciseEntry[];
  waterEntries?: WaterEntry[];
  xpEarnedToday: {
    food: number; // 0 to 1000
    water: number; // 0 to 800
    exercise: number; // 0 to 1200
  };
  completedQuests?: string[];
}

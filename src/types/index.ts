export type Gender = "male" | "female" | "non-binary";

export type WeightUnit = "lbs" | "kg";

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

export interface PlayerInventory {
  clothes: string[];
  hairstyles: string[]; // Unlocked styles
  furniture: string[];
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

  // Customization
  gender: Gender;
  appearance: Appearance;

  // World State
  inventory: PlayerInventory;
  currentHome: string;
  homeLayout: {
    slots: Record<number, string>; // Slot ID -> Item ID
  };

  //   Settings
  settings: {
    weightUnit: WeightUnit;
    language: string; // "en"
    theme: "light" | "dark" | "retro";
  };

  // The Science
  stats: {
    startingWeight: number;
    targetWeight: number;
    weightHistory: WeightEntry[]; // Pruned as discussed
    totalQuestsCompleted: number;
  };
  targetCalories: number;
  targetWater: number; // default to 8
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  timestamp: number;
}

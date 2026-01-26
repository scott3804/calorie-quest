import { db } from "../firebase";
import {
  doc,
  updateDoc,
  setDoc,
  increment,
  arrayUnion,
  collection,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import {
  type WaterEntry,
  type ExerciseEntry,
  type WaterUnit,
  type FoodLogEntry,
  type FoodDefinition,
} from "../types";
import { getLocalTodayString } from "./dateUtils";

/**
 * UPDATES PLAYER PROFILE
 * Used for appearance, level-ups, gold, and goals.
 */
export const updatePlayerProfile = async (
  uid: string,
  updates: Record<string, unknown>,
) => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * LOGS FOOD
 * Updates totalCalories and appends to the foods array.
 */
export const logFoodToDb = async (userId: string, food: FoodLogEntry) => {
  const today = getLocalTodayString();
  const logRef = doc(db, `users/${userId}/dailyLogs`, today);

  await updateDoc(logRef, {
    totalCalories: increment(food.totalCalories),
    foods: arrayUnion(food),
  });
};

/**
 * LOGS WATER
 * Updates totalWater and appends to waterEntries array.
 */
export const logWaterToDb = async (
  userId: string,
  amount: number,
  unit: WaterUnit,
) => {
  const today = getLocalTodayString();
  const logRef = doc(db, `users/${userId}/dailyLogs`, today);

  // Always convert to ML for the backend
  const amountInMl = unit === "oz" ? amount * 29.5735 : amount;

  const newWaterEntry: WaterEntry = {
    id: `water-${Date.now()}`,
    amount: amountInMl, // Stored as ML
    timestamp: new Date().toISOString(),
  };

  await updateDoc(logRef, {
    totalWater: increment(amountInMl),
    waterEntries: arrayUnion(newWaterEntry),
  });
};

/**
 * LOGS EXERCISE
 * Updates totalExerciseMinutes and appends to exercises array.
 */
export const logExerciseToDb = async (
  uid: string,
  name: string,
  duration: number,
) => {
  const today = getLocalTodayString();
  const logRef = doc(db, `users/${uid}/dailyLogs`, today);

  const newExercise: ExerciseEntry = {
    id: `ex-${Date.now()}`,
    name,
    duration,
    timestamp: getLocalTodayString(),
  };

  await updateDoc(logRef, {
    totalExerciseMinutes: increment(duration),
    exercises: arrayUnion(newExercise),
  });
};

/**
 * LOGS WEIGHT
 * Normalizes to KG and appends to stats.weightHistory in the profile.
 */
export const logWeightToDb = async (
  uid: string,
  weight: number,
  unit: "lbs" | "kg",
) => {
  const userRef = doc(db, "users", uid);

  // Normalize to KG for storage
  const weightInKg = unit === "lbs" ? weight / 2.20462 : weight;

  const newEntry = {
    date: getLocalTodayString(),
    weight: weightInKg,
  };

  await updateDoc(userRef, {
    "stats.weightHistory": arrayUnion(newEntry),
  });
};

/**
 * FOOD LIBRARY HELPERS
 */
export const saveCustomFoodDefinition = async (
  uid: string,
  food: Omit<FoodDefinition, "id">,
) => {
  const userRef = doc(db, "users", uid);
  const libraryRef = doc(collection(userRef, "foodLibrary"));
  const id = libraryRef.id;

  await setDoc(libraryRef, {
    ...food,
    id,
  });

  return { id };
};

export const updateFoodFavoriteStatus = async (
  uid: string,
  foodId: string,
  isFavorite: boolean,
) => {
  const foodRef = doc(db, "users", uid, "foodLibrary", foodId);
  return await updateDoc(foodRef, { isFavorite });
};

/**
 * DELETES A FOOD DEFINITION
 * Removes a food from the user's permanent library.
 */
export const deleteFoodFromLibrary = async (uid: string, foodId: string) => {
  const foodRef = doc(db, "users", uid, "foodLibrary", foodId);
  await deleteDoc(foodRef); // You'll need to import deleteDoc from firebase/firestore
};

/**
 * UPDATES AN EXISTING FOOD DEFINITION
 */
export const updateFoodDefinition = async (
  uid: string,
  foodId: string,
  updates: Partial<FoodDefinition>,
) => {
  const foodRef = doc(db, "users", uid, "foodLibrary", foodId);
  return await updateDoc(foodRef, updates); //
};

export const claimQuestReward = async (
  userId: string,
  questId: string,
  rewardAmount: number,
) => {
  const today = getLocalTodayString();
  const logRef = doc(db, `users/${userId}/dailyLogs`, today);
  const userRef = doc(db, "users", userId);

  try {
    await runTransaction(db, async (transaction) => {
      const logSnap = await transaction.get(logRef);
      const userSnap = await transaction.get(userRef);

      if (!logSnap.exists() || !userSnap.exists()) {
        throw "Missing essential log or profile records!";
      }

      const completedQuests = logSnap.data().completedQuests || [];

      if (completedQuests.includes(questId)) {
        throw "Bounty already claimed for today!";
      }

      // Update Gold balance and mark quest as claimed
      transaction.update(userRef, { gold: increment(rewardAmount) });
      transaction.update(logRef, { completedQuests: arrayUnion(questId) });
    });
    return { success: true };
  } catch (e) {
    console.error("Quest claim failed:", e);
    return { success: false, error: e };
  }
};

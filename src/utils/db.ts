import { db } from "../firebase";
import {
  doc,
  updateDoc,
  setDoc,
  getDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { type FoodEntry } from "../types";

export const logFoodToDb = async (userId: string, food: FoodEntry) => {
  const today = new Date().toISOString().split("T")[0];
  const logRef = doc(db, `users/${userId}/dailyLogs`, today);

  const docSnap = await getDoc(logRef);

  if (!docSnap.exists()) {
    // Create new day
    await setDoc(logRef, {
      calories: food.calories,
      foods: arrayUnion(food),
      water: 0,
      date: today,
    });
  } else {
    // Update existing day
    await updateDoc(logRef, {
      calories: increment(food.calories),
      foods: arrayUnion(food),
    });
  }
};

export const logWaterToDb = async (userId: string, amount: number) => {
  const today = new Date().toISOString().split("T")[0];
  const logRef = doc(db, `users/${userId}/dailyLogs`, today);

  await updateDoc(logRef, {
    water: increment(amount),
  });
};

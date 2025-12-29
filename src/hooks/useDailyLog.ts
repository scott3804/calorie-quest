import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { type FoodEntry } from "../types";

export const useDailyLog = (userId: string | undefined) => {
  const [calories, setCalories] = useState(0);
  const [water, setWater] = useState(0);
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];
    const logRef = doc(db, `users/${userId}/dailyLogs`, today);

    // This "onSnapshot" is the real-time listener
    const unsubscribe = onSnapshot(logRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCalories(data.calories || 0);
        setWater(data.water || 0);
        setFoods(data.foods || []);
      } else {
        // If the day hasn't started yet, reset to 0
        setCalories(0);
        setWater(0);
        setFoods([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { calories, water, foods, loading };
};

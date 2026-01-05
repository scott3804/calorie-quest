import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import type { DailyLog } from "../types";

export const useDailyLog = (uid: string, date: string) => {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  const logRef = doc(db, "users", uid, "dailyLogs", date);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(logRef, (snapshot) => {
      if (snapshot.exists()) {
        setLog(snapshot.data() as DailyLog);
      } else {
        const newLog: DailyLog = {
          date,
          totalCalories: 0,
          totalWater: 0,
          totalExerciseMinutes: 0,
          isArchived: false,
          foods: [],
          exercises: [],
          waterEntries: [],
          xpEarnedToday: {
            food: 0,
            water: 0,
            exercise: 0,
          },
        };
        setDoc(logRef, newLog);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, date]);

  // NEW: Delete Food Logic
  const deleteFood = async (id: string) => {
    if (!log?.foods) return;
    const updated = log.foods.filter((f) => f.id !== id);
    const newTotal = updated.reduce((sum, f) => sum + f.calories, 0);

    await updateDoc(logRef, {
      foods: updated,
      totalCalories: newTotal,
    });
  };

  const deleteExercise = async (id: string) => {
    if (!log?.exercises) return;
    const updated = log.exercises.filter((ex) => ex.id !== id);
    const newTotal = updated.reduce((sum, ex) => sum + ex.duration, 0);

    await updateDoc(logRef, {
      exercises: updated,
      totalExerciseMinutes: newTotal,
    });
  };

  const deleteWater = async (id: string) => {
    if (!log?.waterEntries) return;
    const updated = log.waterEntries.filter((w) => w.id !== id);
    const newTotal = updated.reduce((sum, w) => sum + w.amount, 0);

    await updateDoc(logRef, {
      waterEntries: updated,
      totalWater: newTotal,
    });
  };

  return {
    calories: log?.totalCalories || 0,
    water: log?.totalWater || 0,
    exerciseMinutes: log?.totalExerciseMinutes || 0,
    log,
    loading,
    deleteExercise,
    deleteWater,
    deleteFood, // Exported to be used in StatsPage
  };
};

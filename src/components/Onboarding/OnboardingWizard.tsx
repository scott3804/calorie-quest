import React, { useState } from "react";
import { AppearanceSelector } from "./AppearanceSelector";
import { GoalSetter, type GoalData } from "./GoalSetter";
import {
  type Appearance,
  type WeightUnit,
  type PlayerProfile,
} from "../../types";
import { db, auth } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [appearance, setAppearance] = useState<Appearance | null>(null);
  const [unit, setUnit] = useState<WeightUnit>("lbs");

  const handleFinalize = async (goals: GoalData, targetCalories: number) => {
    if (!auth.currentUser || !appearance) return;

    const newProfile: PlayerProfile = {
      version: "1.0.0",
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || "Hero",
      isPremium: false,
      level: 1,
      xp: 0,
      gold: 100,
      currentStreak: 0,
      gender: goals.gender,
      appearance: appearance,
      inventory: {
        clothes: ["starter_tunic"],
        hairstyles: [appearance.hairStyle],
        furniture: [],
        homes: ["studio"],
        accessories: [],
      },
      currentHome: "studio",
      homeLayout: { slots: {} },
      stats: {
        startingWeight: goals.weight,
        targetWeight: goals.targetWeight,
        weightHistory: [
          {
            date: new Date().toISOString().split("T")[0],
            weight: goals.weight,
          },
        ],
        totalQuestsCompleted: 0,
      },
      targetCalories: targetCalories,
      targetWater: 8,
      settings: { weightUnit: unit, language: "en", theme: "retro" },
    };

    await setDoc(doc(db, "users", auth.currentUser.uid), newProfile);
    window.location.reload(); // Quickest way to refresh the useAuth state
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {step === 1 && (
        <AppearanceSelector
          onSave={(res) => {
            setAppearance(res.appearance);
            setUnit(res.unit);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <GoalSetter
          unit={unit}
          onBack={() => setStep(1)}
          onComplete={handleFinalize}
        />
      )}
    </div>
  );
};

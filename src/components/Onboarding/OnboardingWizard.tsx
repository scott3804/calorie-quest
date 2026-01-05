import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { AppearanceSelector } from "./AppearanceSelector";
import { GoalSetter, type GoalData } from "./GoalSetter";
import {
  type Appearance,
  type ThemeOptions,
  type PlayerProfile,
  type WeightUnit,
  type WaterUnit,
} from "../../types";

export const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<ThemeOptions>("light");

  const [appearance, setAppearance] = useState<Appearance>({
    skinColor: "#f3d9c1",
    hairColor: "#4a2c2a",
    eyeColor: "#2d5a27",
    hairStyle: "default_bob",
    currentOutfit: "starter_tunic",
    currentHat: null,
    currentAccessory: null,
  });

  const [goalForm, setGoalForm] = useState<GoalData>({
    age: 25,
    height: 70,
    weight: 180,
    targetWeight: 170,
    gender: "female",
  });

  const handleFinalize = async (
    goals: GoalData, // This contains your 39 age and 75 height
    kcal: number,
    water: number,
    wUnit: WeightUnit,
    fluidUnit: WaterUnit
  ) => {
    if (!auth.currentUser) return;

    const newProfile: PlayerProfile = {
      version: "1.1.0",
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || "Hero",
      isPremium: false,

      level: 1,
      xp: 0,
      gold: 0,
      currentStreak: 0,
      title: "Recruit",
      achievements: [],
      tutorialStep: 0,

      gender: goals.gender, // Use goals param
      appearance: appearance, // Use appearance state

      inventory: {
        clothes: ["starter_tunic"],
        hairstyles: [appearance.hairStyle],
        furniture: [],
        homes: ["studio"],
        accessories: [],
      },
      currentHome: "studio",
      homeLayout: { slots: {} },

      settings: {
        weightUnit: wUnit,
        waterUnit: fluidUnit,
        language: "en",
        theme: theme,
      },

      stats: {
        // FIX: Use 'goals' properties, NOT 'goalForm' state
        age: goals.age,
        height: goals.height,
        startingWeight: goals.weight,
        targetWeight: goals.targetWeight,
        weightHistory: [
          {
            date: new Date().toISOString().split("T")[0],
            weight: goals.weight,
          },
        ],
        totalWorkouts: 0,
        totalWaterLogs: 0,
        totalQuestsCompleted: 0,
      },

      targetCalories: kcal,
      targetWater: water,
    };

    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), newProfile);
      window.location.reload();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save hero profile.");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-main)]">
      {step === 1 && (
        <AppearanceSelector
          initialAppearance={appearance}
          initialTheme={theme}
          onSave={(res) => {
            setAppearance(res.appearance);
            setTheme(res.theme);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <GoalSetter
          initialForm={goalForm}
          initialUnit="lbs"
          initialWaterUnit="oz"
          initialCalories={0}
          initialWater={0}
          theme={theme}
          onBack={(form) => {
            setGoalForm(form);
            setStep(1);
          }}
          onComplete={handleFinalize}
        />
      )}
    </div>
  );
};

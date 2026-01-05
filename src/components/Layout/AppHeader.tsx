import { useState } from "react";
import type { PlayerProfile } from "../../types";
import { Settings } from "lucide-react";
import { AppearanceSelector } from "../Onboarding/AppearanceSelector";
import { GoalSetter, type GoalData } from "../Onboarding/GoalSetter";
import { updatePlayerProfile } from "../../utils/db";
import { SettingsDrawer } from "./SettingsDrawer";

function AppHeader({ profile }: { profile: PlayerProfile }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editMode, setEditMode] = useState<"none" | "appearance" | "goals">(
    "none"
  );

  // --- EDIT APPEARANCE MODE ---
  if (editMode === "appearance") {
    return (
      <AppearanceSelector
        key={profile.settings.theme}
        initialAppearance={profile.appearance}
        initialTheme={profile.settings.theme}
        buttonText="Save Appearance"
        onSave={async (newData) => {
          try {
            const updates: Record<string, unknown> = {
              appearance: newData.appearance,
              "settings.theme": newData.theme,
            };
            await updatePlayerProfile(profile.uid, updates);
            setEditMode("none");
          } catch (err) {
            console.error("Failed to update hero style", err);
          }
        }}
        // Removed onCancel to match the "Save-on-Exit" philosophy
      />
    );
  }

  // --- EDIT GOALS MODE ---
  if (editMode === "goals") {
    const isLbs = profile.settings.weightUnit === "lbs";

    const currentForm: GoalData = {
      age: profile.stats.age,
      height: isLbs ? profile.stats.height / 2.54 : profile.stats.height,
      // Using Math.round here during mapping also prevents the decimal from entering the state
      weight: isLbs
        ? Math.round(profile.stats.startingWeight * 2.20462)
        : profile.stats.startingWeight,
      targetWeight: isLbs
        ? Math.round(profile.stats.targetWeight * 2.20462)
        : profile.stats.targetWeight,
      gender: profile.gender,
    };

    return (
      <GoalSetter
        initialForm={currentForm}
        initialUnit={profile.settings.weightUnit}
        initialWaterUnit={profile.settings.waterUnit}
        initialCalories={profile.targetCalories}
        initialWater={profile.targetWater}
        theme={profile.settings.theme}
        onBack={() => setEditMode("none")}
        onComplete={async (goals, kcal, water, unit, wUnit) => {
          try {
            const updates: Record<string, unknown> = {
              "stats.age": goals.age,
              "stats.height": goals.height,
              "stats.startingWeight": goals.weight,
              "stats.targetWeight": goals.targetWeight,
              gender: goals.gender,
              targetCalories: kcal,
              targetWater: water,
              "settings.weightUnit": unit,
              "settings.waterUnit": wUnit,
            };

            await updatePlayerProfile(profile.uid, updates);
            setEditMode("none");
          } catch (err) {
            console.error("Failed to update goals", err);
          }
        }}
      />
    );
  }

  return (
    <>
      <header className="p-4 flex justify-between items-center bg-[var(--bg-card)] border-b border-[var(--text-primary)]/10">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase text-[var(--accent)] tracking-tighter">
            Lvl {profile.level} {profile.title}
          </span>
          <div className="w-32 h-2 bg-[var(--text-primary)]/10 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full transition-all duration-500"
              style={{ width: `${(profile.xp / 5000) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--text-primary)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/20">
            <span className="text-[var(--accent)] font-black text-sm">
              💰 {profile.gold}
            </span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl transition-colors bg-black/5 text-[var(--text-primary)]"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onEditAppearance={() => {
          setEditMode("appearance");
          setIsSettingsOpen(false);
        }}
        onEditGoals={() => {
          setEditMode("goals");
          setIsSettingsOpen(false);
        }}
      />
    </>
  );
}

export default AppHeader;

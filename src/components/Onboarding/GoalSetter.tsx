import { useState } from "react";
import {
  type Gender,
  type ThemeOptions,
  type WeightUnit,
  type WaterUnit,
} from "../../types";

export interface GoalData {
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  gender: Gender;
}

interface Props {
  initialUnit: WeightUnit;
  initialWaterUnit: WaterUnit;
  initialForm: GoalData; // The "Source of Truth" for existing stats
  initialCalories: number;
  initialWater: number;
  onComplete: (
    goals: GoalData,
    kcal: number,
    water: number,
    unit: WeightUnit,
    wUnit: WaterUnit
  ) => void;
  onBack: (currentForm: GoalData) => void;
  theme: ThemeOptions;
}

export const GoalSetter = ({
  initialUnit,
  initialWaterUnit,
  initialForm,
  initialCalories, // Use this
  initialWater, // Use this
  onComplete,
  onBack,
  theme,
}: Props) => {
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [waterUnit, setWaterUnit] = useState<WaterUnit>(initialWaterUnit);
  const [form, setForm] = useState<GoalData>(initialForm);

  // Initialize with the passed values to persist manual overrides
  const [manualWater, setManualWater] = useState<number | null>(
    initialWater || null
  );
  const [manualCalories, setManualCalories] = useState<number | null>(
    initialCalories || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const calculateSuggestedWater = () => {
    const weightInKg = unit === "lbs" ? form.weight / 2.204 : form.weight;
    let ml = weightInKg * 33;
    if (form.gender === "male") ml += 500;

    const suggestedMl = Math.round(ml);
    return waterUnit === "ml" ? suggestedMl : Math.round(suggestedMl / 29.57);
  };

  const calculateSuggestedCalories = () => {
    const w = unit === "lbs" ? form.weight / 2.204 : form.weight;
    const h = unit === "lbs" ? form.height * 2.54 : form.height;
    // Using the "Neutral Middle" offset of -78 for Non-Binary
    const genderOffset =
      form.gender === "male" ? 5 : form.gender === "female" ? -161 : -78;
    const bmr = 10 * w + 6.25 * h - 5 * form.age + genderOffset;
    return Math.round(bmr * 1.2) - 500;
  };

  const finalWater = manualWater ?? calculateSuggestedWater();
  const finalCalories = manualCalories ?? calculateSuggestedCalories();

  const submitForm = () => {
    setIsSaving(true);

    // 1. Normalize the weight and height stats to kg/cm
    const normalizedGoals: GoalData = {
      ...form,
      height: unit === "lbs" ? form.height * 2.54 : form.height,
      weight: unit === "lbs" ? form.weight / 2.20462 : form.weight,
      targetWeight:
        unit === "lbs" ? form.targetWeight / 2.20462 : form.targetWeight,
    };

    // 2. Normalize the manual/suggested water goal to ml
    const normalizedWater =
      waterUnit === "oz" ? Math.round(finalWater * 29.57) : finalWater;

    // 3. Pass the normalized data up
    onComplete(
      normalizedGoals,
      finalCalories,
      normalizedWater,
      unit,
      waterUnit
    );
  };

  return (
    <div
      className={`h-screen overflow-y-auto bg-[var(--bg-main)] p-6 pb-24 flex flex-col items-center ${
        theme === "retro" ? "retro-screen-filter" : ""
      }`}
    >
      <div className="w-full max-w-md">
        {/* Back button now triggers onBack while persisting current form */}
        <button
          onClick={() => onBack(form)}
          className="text-[var(--text-primary)] opacity-40 text-sm mb-4 font-bold uppercase tracking-widest hover:opacity-100 transition-opacity"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6">
          The Science
        </h2>

        <div className="space-y-6 bg-[var(--bg-card)] p-6 rounded-3xl shadow-xl border border-black/5">
          {/* Identity Picker */}
          <div>
            <label className="block text-[10px] font-black opacity-40 uppercase mb-2 text-[var(--text-primary)] tracking-widest text-center">
              Identity
            </label>
            <div className="flex gap-2 bg-black/5 p-1 rounded-xl">
              {(["male", "female", "non-binary"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all uppercase ${
                    form.gender === g
                      ? "bg-[var(--bg-main)] shadow text-blue-500"
                      : "opacity-40 text-[var(--text-primary)]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              value={form.age}
              onChange={(v) => setForm({ ...form, age: parseInt(v) || 0 })}
            />
            <Input
              label={`Water Goal (${waterUnit})`}
              value={finalWater}
              onChange={(v) => setManualWater(parseInt(v) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <UnitToggle
              label="Mass"
              options={["lbs", "kg"]}
              active={unit}
              onSelect={(u) => setUnit(u as WeightUnit)}
            />
            <UnitToggle
              label="Fluid"
              options={["oz", "ml"]}
              active={waterUnit}
              onSelect={(u) => setWaterUnit(u as WaterUnit)}
            />
          </div>

          <Input
            label={`Height (${unit === "lbs" ? "in" : "cm"})`}
            value={form.height}
            onChange={(v) => setForm({ ...form, height: parseFloat(v) || 0 })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Current (${unit})`}
              value={form.weight}
              onChange={(v) => setForm({ ...form, weight: parseFloat(v) || 0 })}
            />
            <Input
              label={`Target (${unit})`}
              value={form.targetWeight}
              onChange={(v) =>
                setForm({ ...form, targetWeight: parseFloat(v) || 0 })
              }
            />
          </div>
        </div>

        {/* Calorie Card */}
        <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white shadow-xl">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
            Daily Food Goal
          </p>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={finalCalories}
              onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
              className="bg-transparent text-4xl font-black w-32 outline-none border-b-2 border-blue-400 focus:border-white transition-colors"
            />
            <span className="text-xl font-bold opacity-80">kcal</span>
          </div>
        </div>

        <button
          onClick={submitForm}
          disabled={isSaving}
          style={{ backgroundColor: "var(--accent)", color: "var(--bg-main)" }}
          className="mt-6 w-full py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1 text-center">
    <label className="text-[10px] font-black uppercase opacity-60 tracking-wider text-[var(--text-primary)]">
      {label}
    </label>
    <input
      type="number"
      // Change this to Math.round to eliminate the ".1" decimal creep
      value={Math.round(value)}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-black/10 p-3 rounded-2xl font-bold outline-none text-[var(--text-primary)] bg-black/5 text-center"
    />
  </div>
);

const UnitToggle = ({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest text-center text-[var(--text-primary)]">
      {label}
    </label>
    <div className="flex bg-black/5 p-1 rounded-xl">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSelect(o)}
          className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
            active === o
              ? "bg-[var(--bg-main)] shadow text-blue-500"
              : "opacity-40 text-[var(--text-primary)]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

import React, { useState } from "react";
import { type Gender, type WeightUnit } from "../../types";

export interface GoalData {
  age: number;
  height: number; // store in cm
  weight: number; // store in kg
  targetWeight: number; // store in kg
  gender: Gender;
}

interface Props {
  unit: WeightUnit;
  onComplete: (goals: GoalData, targetCalories: number) => void;
  onBack: () => void;
}

export const GoalSetter = ({ unit, onComplete, onBack }: Props) => {
  const [form, setForm] = useState({
    age: 25,
    height: unit === "lbs" ? 70 : 175, // inches vs cm
    weight: unit === "lbs" ? 180 : 80,
    targetWeight: unit === "lbs" ? 170 : 75,
    gender: "female" as Gender,
  });

  const calculateSuggestedCalories = () => {
    // Convert to Metric for math if needed
    const w = unit === "lbs" ? form.weight / 2.2 : form.weight;
    const h = unit === "lbs" ? form.height * 2.54 : form.height;

    // Mifflin-St Jeor BMR
    const bmr =
      10 * w + 6.25 * h - 5 * form.age + (form.gender === "male" ? 5 : -161);
    const tdee = Math.round(bmr * 1.2); // Sedentary multiplier
    return tdee - 500; // Standard 1lb/week loss deficit
  };

  const suggested = calculateSuggestedCalories();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-6">
      <button
        onClick={onBack}
        className="text-slate-400 text-sm mb-4 font-bold"
      >
        ← BACK TO STYLE
      </button>
      <h2 className="text-2xl font-black text-slate-800 mb-6">The Science</h2>

      <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
            Gender for calculation
          </label>
          <div className="flex gap-2">
            {["female", "male"].map((g) => (
              <button
                key={g}
                onClick={() => setForm({ ...form, gender: g as Gender })}
                className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${
                  form.gender === g
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-100 text-slate-400"
                }`}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Age"
            value={form.age}
            onChange={(v) => setForm({ ...form, age: parseInt(v) })}
          />
          <Input
            label={`Height (${unit === "lbs" ? "in" : "cm"})`}
            value={form.height}
            onChange={(v) => setForm({ ...form, height: parseInt(v) })}
          />
        </div>

        <Input
          label={`Current Weight (${unit})`}
          value={form.weight}
          onChange={(v) => setForm({ ...form, weight: parseInt(v) })}
        />
        <Input
          label={`Target Weight (${unit})`}
          value={form.targetWeight}
          onChange={(v) => setForm({ ...form, targetWeight: parseInt(v) })}
        />
      </div>

      <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white shadow-xl">
        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
          Daily Quest Goal
        </p>
        <h3 className="text-4xl font-black mb-2">{suggested} kcal</h3>
        <p className="text-sm text-blue-100 opacity-80">
          This is your recommended intake to lose weight safely.
        </p>
        {suggested < 1200 && (
          <p className="mt-3 p-2 bg-red-500/30 rounded-lg text-xs font-bold border border-red-400">
            ⚠️ WARNING: This target is very low. Consult a doctor before
            starting.
          </p>
        )}
      </div>

      <button
        onClick={() => {
          // Convert everything to the "Golden Units" (kg/cm) for DB storage
          const finalData = {
            age: form.age,
            height: unit === "lbs" ? form.height * 2.54 : form.height,
            weight: unit === "lbs" ? form.weight / 2.204 : form.weight,
            targetWeight:
              unit === "lbs" ? form.targetWeight / 2.204 : form.targetWeight,
            gender: form.gender,
          };
          onComplete(finalData, suggested);
        }}
        className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform"
      >
        Finalize Hero
      </button>
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
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
    />
  </div>
);

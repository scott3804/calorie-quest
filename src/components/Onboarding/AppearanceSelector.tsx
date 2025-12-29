import React, { useState } from "react";
import { PaperDoll } from "../Character/PaperDoll";
import { type Appearance, type WeightUnit } from "../../types";

interface Props {
  // Pass existing values when editing, or undefined when creating new
  initialAppearance?: Appearance;
  initialUnit?: WeightUnit;
  onSave: (data: { appearance: Appearance; unit: WeightUnit }) => void;
  buttonText?: string;
}

export const AppearanceSelector = ({
  initialAppearance,
  initialUnit = "lbs",
  onSave,
  buttonText = "Next Step",
}: Props) => {
  const [appearance, setAppearance] = useState<Appearance>(
    initialAppearance || {
      skinColor: "#f3d9c1",
      hairColor: "#4a2c2a",
      eyeColor: "#2d5a27",
      hairStyle: "default_bob",
      currentOutfit: "starter_tunic",
      currentHat: null,
      currentAccessory: null,
    }
  );

  const [unit, setUnit] = useState<WeightUnit>(initialUnit);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-6 pb-24">
      <h2 className="text-2xl font-black text-slate-800 mb-2">
        Create Your Hero
      </h2>
      <p className="text-slate-500 mb-6">
        Style your character and pick your units.
      </p>

      {/* Preview Section */}
      <div className="w-full aspect-square max-w-[300px] mx-auto mb-8 bg-white rounded-3xl shadow-xl p-4 border-4 border-slate-200">
        <PaperDoll
          skinColor={appearance.skinColor}
          hairColor={appearance.hairColor}
          eyeColor={appearance.eyeColor}
          shirtColor="#3b82f6"
          showHair={true}
        />
      </div>

      {/* Controls Section */}
      <div className="space-y-6 w-full max-w-md mx-auto">
        {/* Unit Toggle */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-700">Weight Units</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["lbs", "kg"] as WeightUnit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  unit === u
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-400"
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 gap-4">
          <ColorRow
            label="Skin"
            value={appearance.skinColor}
            onChange={(c) => setAppearance({ ...appearance, skinColor: c })}
          />
          <ColorRow
            label="Hair"
            value={appearance.hairColor}
            onChange={(c) => setAppearance({ ...appearance, hairColor: c })}
          />
          <ColorRow
            label="Eyes"
            value={appearance.eyeColor}
            onChange={(c) => setAppearance({ ...appearance, eyeColor: c })}
          />
        </div>

        <button
          onClick={() => onSave({ appearance, unit })}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

// Small Helper Component for the rows
const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    <span className="font-bold text-slate-700">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
    />
  </div>
);

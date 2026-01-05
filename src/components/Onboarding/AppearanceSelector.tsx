import { useEffect, useState } from "react";
import { PaperDoll } from "../Character/PaperDoll";
import { type Appearance, type ThemeOptions } from "../../types";

interface Props {
  initialAppearance?: Appearance;
  initialTheme?: ThemeOptions;
  onSave: (data: { appearance: Appearance; theme: ThemeOptions }) => void;
  buttonText?: string;
}

export const AppearanceSelector = ({
  initialAppearance,
  initialTheme = "light",
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

  const [theme, setTheme] = useState(initialTheme);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ appearance, theme });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`h-screen overflow-y-auto bg-[var(--bg-main)] transition-colors duration-300 flex flex-col items-center p-6 pb-12
      ${theme === "retro" ? "retro-screen-filter" : ""}`}
    >
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">
          Create Your Hero
        </h2>
        <p className="opacity-60 text-[var(--text-primary)] mb-6">
          Style your character and pick your vibe.
        </p>

        {/* Preview Section */}
        <div className="w-full aspect-square max-w-[300px] mx-auto mb-8 bg-[var(--bg-card)] rounded-3xl shadow-xl p-4 border-4 border-black/5 flex items-center justify-center">
          <PaperDoll
            skinColor={appearance.skinColor}
            hairColor={appearance.hairColor}
            eyeColor={appearance.eyeColor}
            shirtColor="var(--accent)"
            showHair={true}
          />
        </div>

        <div className="space-y-4">
          {/* Theme Selector Section */}
          <div className="bg-[var(--bg-card)] p-4 rounded-2xl shadow-sm border border-black/5">
            <label className="block text-xs font-bold opacity-60 uppercase mb-3 text-[var(--text-primary)]">
              App Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "retro"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTheme(t);
                    document.documentElement.setAttribute("data-theme", t);
                  }}
                  className={`py-2 rounded-xl font-black text-xs uppercase transition-all border-2 ${
                    theme === t
                      ? "border-blue-500 bg-blue-500/10 text-blue-500"
                      : "border-black/5 text-[var(--text-primary)] opacity-40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

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

          <button
            onClick={handleSave}
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg-main)",
            }}
            disabled={isSaving}
            className="w-full py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all mt-4"
          >
            {isSaving ? "Saving..." : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) => (
  <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-2xl border border-black/5 shadow-sm">
    <span className="font-bold text-[var(--text-primary)]">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
    />
  </div>
);

import { type PlayerProfile } from "../../types";
import { PaperDoll } from "../Character/PaperDoll";
import { Loader2 } from "lucide-react";
import { useDailyLog } from "../../hooks/useDailyLog";
import { getLocalTodayString } from "../../utils/dateUtils";

interface Props {
  profile: PlayerProfile;
}

export const HomeView = ({ profile }: Props) => {
  const today = getLocalTodayString();

  const {
    calories,
    water,
    exerciseMinutes,
    loading: logLoading,
  } = useDailyLog(profile.uid, today);

  const isOz = profile.settings.waterUnit === "oz";

  // Convert DB ml to display oz if necessary
  const displayWater = isOz ? Math.round(water / 29.57) : water;
  const displayTargetWater = isOz
    ? Math.round(profile.targetWater / 29.57)
    : profile.targetWater;

  // Percent Calculations
  const caloriePercent = Math.min(
    (calories / profile.targetCalories) * 100,
    100
  );
  const waterPercent = Math.min(
    (displayWater / (displayTargetWater || 1)) * 100,
    100
  );
  const staminaPercent = Math.round(
    Math.min((exerciseMinutes / 30) * 100, 100)
  );

  // Game Logic Flags
  const isNourished = caloriePercent >= 80;
  const isOverstuffed = caloriePercent > 110;
  const isHydrated = waterPercent >= 80;
  const isTrained = staminaPercent >= 80;
  const canFightBoss = isNourished && !isOverstuffed && isHydrated && isTrained;

  return (
    <div className="h-full flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* 1. LOADING OVERLAY */}
      {logLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)]/50 backdrop-blur-sm">
          <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
        </div>
      )}

      {/* 2. MAIN GAME AREA (The Hero & Backdrop) */}
      <div
        className={`flex-1 relative flex items-center justify-center p-6 transition-colors duration-300 
          ${profile.settings.theme === "retro" ? "retro-screen-filter" : ""}
          bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-card)]`}
      >
        {/* Floor/Wall Lines */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full border-b-[50px] border-[var(--text-primary)]" />
        </div>

        {/* The Hero Container */}
        <div
          className={`relative z-10 w-64 h-64 transition-all duration-500 
            ${isOverstuffed ? "grayscale-[0.5] opacity-80 scale-110" : ""}`}
        >
          <PaperDoll
            skinColor={profile.appearance.skinColor}
            hairColor={profile.appearance.hairColor}
            eyeColor={profile.appearance.eyeColor}
            shirtColor="var(--accent)"
            showHair={true}
          />

          {isOverstuffed && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] px-2 py-1 rounded font-black animate-bounce">
              OVERSATURATED (-10 SPD)
            </div>
          )}
        </div>
      </div>

      {/* 3. STATS HUD (Orbs & Stamina) */}
      {/* Removing absolute positioning here makes it stay pinned above the Nav */}
      <div className="px-6 pb-8 pt-4 flex items-end justify-between gap-4 bg-transparent z-20">
        {/* Health Orb */}
        <div className="flex flex-col items-center gap-2">
          <Orb fillPercent={caloriePercent} color="bg-red-500" label="Health" />
          <div className="text-center">
            <p className="text-xs font-black text-[var(--text-primary)]">
              {calories} / {profile.targetCalories}{" "}
              <span className="opacity-40 uppercase text-[8px]">kcal</span>
            </p>
          </div>
        </div>

        {/* Boss Indicator / Center Stamina Area */}
        <div className="flex-1 flex flex-col items-center gap-2 pointer-events-auto">
          {canFightBoss ? (
            <div className="bg-[var(--accent)] text-[var(--bg-main)] px-3 py-1 rounded font-black text-[10px] animate-bounce shadow-lg">
              ⚔️ BOSS READY
            </div>
          ) : isOverstuffed ? (
            <div className="bg-red-600 text-white px-3 py-1 rounded font-black text-[10px] animate-pulse shadow-lg">
              🤢 TOO FULL
            </div>
          ) : null}

          {/* Stamina Bar */}
          <div className="w-full max-w-[140px]">
            <div className="flex justify-between text-[10px] font-black uppercase opacity-60 mb-1 text-[var(--text-primary)]">
              <span className="tracking-tighter">Stamina</span>
              <span>{staminaPercent}%</span>
            </div>
            <div className="h-6 bg-black/20 rounded-lg border-2 border-black/10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] overflow-hidden relative p-1">
              <div
                className="h-full bg-yellow-500 rounded-sm transition-all duration-1000 relative"
                style={{
                  width: `${staminaPercent}%`,
                  backgroundImage:
                    profile.settings.theme === "retro"
                      ? "linear-gradient(90deg, transparent 85%, rgba(0,0,0,0.2) 85%)"
                      : "none",
                  backgroundSize: "12px 100%",
                }}
              >
                <div className="orb-shine absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Mana Orb */}
        <div className="flex flex-col items-center gap-2">
          <Orb fillPercent={waterPercent} color="bg-blue-600" label="Mana" />
          <div className="text-center">
            <p className="text-xs font-black text-[var(--text-primary)]">
              {displayWater} / {displayTargetWater}{" "}
              <span className="opacity-40 uppercase text-[8px]">
                {profile.settings.waterUnit}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Orb
const Orb = ({
  fillPercent,
  color,
  label,
}: {
  fillPercent: number;
  color: string;
  label: string;
}) => {
  const isOverfilled = fillPercent > 110;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-16 h-16 rounded-full border-2 border-[var(--text-primary)]/20 bg-[var(--bg-card)] p-1 relative overflow-hidden shadow-inner ${
          isOverfilled ? "animate-pulse" : ""
        }`}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${color} opacity-80`}
          style={{ height: `${Math.min(fillPercent, 100)}%` }}
        />
        <div className="orb-shine absolute top-0 left-1 w-10 h-6 bg-white/20 rounded-[100%] rotate-[-25deg] blur-[1px]" />
        <div className="orb-shine absolute top-1 left-3 w-2 h-2 bg-white/40 rounded-full blur-[0.5px]" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] drop-shadow-sm z-10">
          {Math.round(fillPercent)}%
        </div>
      </div>
      <span className="text-[10px] font-black text-[var(--text-primary)] opacity-40 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
};

import { useDailyLog } from "../../hooks/useDailyLog";
import { GoalDonut } from "../Charts/GoalDonut"; //
import type {
  WaterEntry,
  ExerciseEntry,
  PlayerProfile,
  FoodLogEntry,
} from "../../types";
import { formatTimestamp, getLocalTodayString } from "../../utils/dateUtils";
import { useState } from "react";
import { WeightChart } from "../Charts/WeightsChart";

interface StatsPageProps {
  profile: PlayerProfile;
}

export const StatsPage = ({ profile }: StatsPageProps) => {
  const today = getLocalTodayString();
  const { log, loading, deleteExercise, deleteWater, deleteFood } = useDailyLog(
    profile.uid,
    today,
  );
  const [activeTab, setActiveTab] = useState<"today" | "trends">("today");

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center p-10 opacity-50 font-black italic">
        SCANNING RECORDS...
      </div>
    );

  const waterEntries = log?.waterEntries || [];
  const exercises = log?.exercises || [];
  const foods = log?.foods || [];

  const isOz = profile.settings.waterUnit === "oz";
  const displayTotalWater = isOz
    ? Math.round((log?.totalWater || 0) / 29.57)
    : log?.totalWater || 0;
  const displayTargetWater = isOz
    ? Math.round((profile.targetWater || 0) / 29.57)
    : profile.targetWater || 0;

  const totals = foods.reduce(
    (acc, f) => ({
      p: acc.p + Number(f.protein || 0),
      c: acc.c + Number(f.carbs || 0),
      f: acc.f + Number(f.fat || 0),
    }),
    { p: 0, c: 0, f: 0 },
  );

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in duration-500 bg-[var(--bg-main)]">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
            Statistics
          </h2>
          <p className="text-[var(--accent)] font-bold text-xs mt-1">
            {activeTab === "today" ? today : "All-Time Records"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-black/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              activeTab === "today"
                ? "bg-[var(--bg-main)] shadow text-blue-500"
                : "opacity-40"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              activeTab === "trends"
                ? "bg-[var(--bg-main)] shadow text-blue-500"
                : "opacity-40"
            }`}
          >
            Trends
          </button>
        </div>
      </header>
      {activeTab === "today" ? (
        <>
          <header>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              Daily Log
            </h2>
            <p className="text-[var(--accent)] font-bold text-xs">{today}</p>
          </header>

          {/* --- QUICK SUMMARY DASHBOARD --- */}
          <section className="flex gap-2 overflow-x-auto pb-2 no-scrollbar bg-black/5 rounded-[2rem] p-3 border-2 border-black/5">
            <div className="flex-shrink-0 w-28">
              <GoalDonut
                current={log?.totalCalories || 0}
                target={profile.targetCalories}
                label="Fuel"
                unit="kcal"
                color="#ef4444"
              />
            </div>
            <div className="flex-shrink-0 w-28">
              <GoalDonut
                current={displayTotalWater}
                target={displayTargetWater}
                label="Mana"
                unit={profile.settings.waterUnit}
                color="#3b82f6"
              />
            </div>
            {/* Width set to ensure this chart peeks onto the screen */}
            <div className="flex-shrink-0 w-28">
              <GoalDonut
                current={log?.totalExerciseMinutes || 0}
                target={30}
                label="Stamina"
                unit="min"
                color="#eab308"
              />
            </div>
          </section>

          <section className="flex gap-2 overflow-x-auto pb-2 no-scrollbar bg-black/5 rounded-[2rem] p-3 border-2 border-black/5">
            <div className="grid grid-cols-3 gap-2 px-2 mt-2">
              <div className="bg-blue-500/10 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black uppercase text-blue-500">
                  Protein
                </p>
                <p className="text-sm font-black text-[var(--text-primary)]">
                  {Math.round(totals.p)}g
                </p>
              </div>
              <div className="bg-orange-500/10 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black uppercase text-orange-500">
                  Carbs
                </p>
                <p className="text-sm font-black text-[var(--text-primary)]">
                  {Math.round(totals.c)}g
                </p>
              </div>
              <div className="bg-yellow-500/10 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black uppercase text-yellow-600">
                  Fat
                </p>
                <p className="text-sm font-black text-[var(--text-primary)]">
                  {Math.round(totals.f)}g
                </p>
              </div>
            </div>
          </section>

          {/* 1. FUEL SECTION (FOOD) */}
          <section className="bg-black/5 rounded-3xl p-6 border-2 border-black/5">
            <h3 className="text-sm font-black uppercase opacity-40 mb-4 tracking-widest text-[var(--text-primary)]">
              Fuel History
            </h3>
            <div className="space-y-3">
              {foods.length === 0 && (
                <p className="text-xs italic opacity-30 text-[var(--text-primary)]">
                  No health orbs consumed...
                </p>
              )}
              {foods.map((f: FoodLogEntry) => (
                <div
                  key={f.id}
                  className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-black/5"
                >
                  <div>
                    <p className="font-black text-sm uppercase text-[var(--text-primary)]">
                      {f.name}
                      {/* Show multiplier if it isn't exactly 1 */}
                      {f.multiplier && f.multiplier !== 1 ? (
                        <span className="text-[var(--accent)] ml-2 text-xs">
                          x {f.multiplier}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[10px] opacity-40 font-bold text-[var(--text-primary)] uppercase tracking-tight">
                      {f.totalCalories} KCAL
                      {/* Show protein if available */}
                      {f.protein ? ` • ${Math.round(f.protein)}G Protein` : ""}
                      {` • ${formatTimestamp(f.timestamp)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFood(f.id)}
                    className="text-red-500 text-[10px] font-black uppercase hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 2. HYDRATION SECTION (WATER) */}
          <section className="bg-black/5 rounded-3xl p-6 border-2 border-black/5">
            <h3 className="text-sm font-black uppercase opacity-40 mb-4 tracking-widest text-[var(--text-primary)]">
              Hydration History
            </h3>
            <div className="space-y-3">
              {waterEntries.length === 0 && (
                <p className="text-xs italic opacity-30 text-[var(--text-primary)]">
                  No mana consumed yet...
                </p>
              )}
              {waterEntries.map((w: WaterEntry) => {
                const displayAmount = isOz
                  ? Math.round(w.amount / 29.57)
                  : w.amount;
                return (
                  <div
                    key={w.id}
                    className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-black/5"
                  >
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      <span>
                        {displayAmount} {profile.settings.waterUnit}
                      </span>{" "}
                      <span className="text-[10px] opacity-30 ml-2 font-normal">
                        {formatTimestamp(w.timestamp)}
                      </span>
                    </span>
                    <button
                      onClick={() => deleteWater(w.id)}
                      className="text-red-500 text-[10px] font-black uppercase hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. TRAINING SECTION (EXERCISE) */}
          <section className="bg-black/5 rounded-3xl p-6 border-2 border-black/5">
            <h3 className="text-sm font-black uppercase opacity-40 mb-4 tracking-widest text-[var(--text-primary)]">
              Training History
            </h3>
            <div className="space-y-3">
              {exercises.length === 0 && (
                <p className="text-xs italic opacity-30 text-[var(--text-primary)]">
                  No stamina expended...
                </p>
              )}
              {exercises.map((ex: ExerciseEntry) => (
                <div
                  key={ex.id}
                  className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-black/5"
                >
                  <div>
                    <p className="font-black text-sm uppercase text-[var(--text-primary)]">
                      {ex.name}
                    </p>
                    <p className="text-[10px] opacity-40 font-bold text-[var(--text-primary)]">
                      {ex.duration} MINS • {formatTimestamp(ex.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExercise(ex.id)}
                    className="text-red-500 text-[10px] font-black uppercase hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* --- TRENDS VIEW --- */
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <WeightChart
            data={profile.stats.weightHistory}
            unit={profile.settings.weightUnit}
          />

          {/* Placeholder for future Trend Charts (Calorie/Water) */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-black/5 p-8 rounded-[2rem] border-2 border-dashed border-black/10 text-center">
              <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">
                More Trends Coming Soon
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

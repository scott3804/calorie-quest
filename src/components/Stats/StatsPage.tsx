import { useDailyLog } from "../../hooks/useDailyLog";
import type {
  WaterEntry,
  ExerciseEntry,
  FoodEntry,
  PlayerProfile,
} from "../../types";
import { formatTimestamp, getLocalTodayString } from "../../utils/dateUtils";

interface StatsPageProps {
  profile: PlayerProfile;
}

export const StatsPage = ({ profile }: StatsPageProps) => {
  const today = getLocalTodayString();
  // Added deleteFood to the hook
  const { log, loading, deleteExercise, deleteWater, deleteFood } = useDailyLog(
    profile.uid,
    today
  );

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center p-10 opacity-50 font-black italic">
        SCANNING RECORDS...
      </div>
    );

  const waterEntries = log?.waterEntries || [];
  const exercises = log?.exercises || [];
  const foods = log?.foods || []; // Added foods array

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[var(--bg-main)]">
      <header>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
          Daily Log
        </h2>
        <p className="text-[var(--accent)] font-bold text-xs">{today}</p>
      </header>

      {/* 1. FUEL SECTION (FOOD) */}
      <section className="bg-black/5 rounded-3xl p-6 border-2 border-black/5">
        <h3 className="text-sm font-black uppercase opacity-40 mb-4 tracking-widest text-[var(--text-primary)]">
          Fuel ({log?.totalCalories || 0} / {profile.targetCalories} kcal)
        </h3>
        <div className="space-y-3">
          {foods.length === 0 && (
            <p className="text-xs italic opacity-30 text-[var(--text-primary)]">
              No health orbs consumed...
            </p>
          )}
          {foods.map((f: FoodEntry) => (
            <div
              key={f.id}
              className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-black/5"
            >
              <div>
                <p className="font-black text-sm uppercase text-[var(--text-primary)]">
                  {f.name}
                </p>
                <p className="text-[10px] opacity-40 font-bold text-[var(--text-primary)]">
                  {f.calories} KCAL • {formatTimestamp(f.timestamp)}
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
          Hydration ({log?.totalWater || 0} / {profile.targetWater}{" "}
          {profile.settings.waterUnit})
        </h3>
        <div className="space-y-3">
          {waterEntries.length === 0 && (
            <p className="text-xs italic opacity-30 text-[var(--text-primary)]">
              No mana consumed yet...
            </p>
          )}
          {waterEntries.map((w: WaterEntry) => (
            <div
              key={w.id}
              className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-black/5"
            >
              <span className="font-bold text-sm text-[var(--text-primary)]">
                {w.amount} {profile.settings.waterUnit}{" "}
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
          ))}
        </div>
      </section>

      {/* 3. TRAINING SECTION (EXERCISE) */}
      <section className="bg-black/5 rounded-3xl p-6 border-2 border-black/5">
        <h3 className="text-sm font-black uppercase opacity-40 mb-4 tracking-widest text-[var(--text-primary)]">
          Training ({log?.totalExerciseMinutes || 0} min)
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
    </div>
  );
};

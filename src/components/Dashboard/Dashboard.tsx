import { useState } from "react";
import { type FoodEntry, type PlayerProfile } from "../../types";
import { PaperDoll } from "../Character/PaperDoll";
import { Home, BarChart2, Plus, Map, ShoppingBag, Loader2 } from "lucide-react";
import { AddEntryDrawer } from "./AddEntryDrawer";
import { useDailyLog } from "../../hooks/useDailyLog";
import { logFoodToDb, logWaterToDb } from "../../utils/db";

interface Props {
  profile: PlayerProfile;
}

export const Dashboard = ({ profile }: Props) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // This is our live data stream from Firestore
  const { calories, water, loading: logLoading } = useDailyLog(profile.uid);

  // Corrected Handlers: They talk to the DB, not local state
  const handleAddWater = async (amount: number) => {
    try {
      await logWaterToDb(profile.uid, amount);
    } catch (err) {
      console.error("Failed to log water:", err);
    }
  };

  const handleAddFood = async (food: FoodEntry) => {
    try {
      await logFoodToDb(profile.uid, food);
      setIsAddOpen(false);
    } catch (err) {
      console.error("Failed to log food:", err);
    }
  };

  const caloriePercent = Math.min(
    (calories / profile.targetCalories) * 100,
    100
  );
  const waterPercent = Math.min(
    (water / (profile.targetWater || 8)) * 100,
    100
  );
  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
        {/* TOP HUD: XP & Gold */}
        <header className="p-4 flex justify-between items-center bg-slate-800/50 border-b border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase text-blue-400 tracking-tighter">
              Lvl {profile.level} Hero
            </span>
            <div className="w-32 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div className="bg-blue-500 h-full w-[40%]" /> {/* XP Fill */}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full border border-yellow-500/30">
            <span className="text-yellow-400 font-black">
              💰 {profile.gold}
            </span>
          </div>
        </header>

        {/* MAIN GAME AREA: The Room */}
        <main className="flex-1 relative flex items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-800">
          {/* Global Loading Overlay for initial data fetch */}
          {logLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          )}
          {/* The Room Backdrop (Placeholder for slots) */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full border-b-[50px] border-slate-700" />
          </div>

          {/* The Hero */}
          <div className="z-10 w-64 h-64 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
            <PaperDoll
              skinColor={profile.appearance.skinColor}
              hairColor={profile.appearance.hairColor}
              eyeColor={profile.appearance.eyeColor}
              shirtColor="#3b82f6"
              showHair={true}
            />
          </div>

          {/* SIDE GLOBES: Calories & Water */}
          <div className="absolute bottom-10 left-6 flex flex-col items-center">
            <Orb fillPercent={caloriePercent} color="bg-red-600" label="KCAL" />
          </div>

          <div className="absolute bottom-10 right-6 flex flex-col items-center">
            <Orb fillPercent={waterPercent} color="bg-cyan-500" label="H2O" />
          </div>
        </main>

        {/* BOTTOM NAV: Actions */}
        <nav className="p-4 pb-8 bg-slate-800 border-t border-slate-700 grid grid-cols-5 gap-2">
          <NavBtn icon={<Home size={20} />} label="Home" active />
          <NavBtn icon={<BarChart2 size={20} />} label="Stats" />

          <div className="relative -top-6">
            <button
              onClick={() => setIsAddOpen(true)} // Open the drawer
              className="bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 border-4 border-slate-800 active:scale-90 transition-transform text-white"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>

          <NavBtn icon={<Map size={20} />} label="Quest" />
          <NavBtn icon={<ShoppingBag size={20} />} label="Shop" />
        </nav>
      </div>
      <AddEntryDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddWater={handleAddWater}
        onAddFood={handleAddFood}
      />
    </>
  );
};

// Helper Components
const Orb = ({
  fillPercent,
  color,
  label,
}: {
  fillPercent: number;
  color: string;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-800 p-1 relative overflow-hidden shadow-inner">
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${color}`}
        style={{ height: `${fillPercent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black drop-shadow-md">
        {Math.round(fillPercent)}%
      </div>
    </div>
    <span className="text-[10px] font-black text-slate-500 uppercase">
      {label}
    </span>
  </div>
);

const NavBtn = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <button
    className={`flex flex-col items-center justify-center ${
      active ? "text-blue-400" : "text-slate-500"
    }`}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-wider">
      {label}
    </span>
  </button>
);

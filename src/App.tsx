import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { OnboardingWizard } from "./components/Onboarding/OnboardingWizard";
import { StatsPage } from "./components/Stats/StatsPage"; // Import StatsPage
import { signInWithGoogle } from "./firebase";
import HeroIcon from "./assets/icon.svg";
import { HomeView } from "./components/Home/HomeView";
import AppHeader from "./components/Layout/AppHeader";
import { BottomNav } from "./components/Layout/BottomNav";
import { AddEntryDrawer } from "./components/Layout/AddEntryDrawer";
import {
  logExerciseToDb,
  logFoodToDb,
  logWaterToDb,
  logWeightToDb,
} from "./utils/db";
import type { FoodEntry, WaterUnit } from "./types";
import { QuestView } from "./components/Quests/QuestsView";
import { ShopView } from "./components/Shop/ShopView";

// Define the available tabs/views
export type View = "home" | "stats" | "quest" | "shop";

function App() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>("home");
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    if (profile?.settings?.theme) {
      document.documentElement.setAttribute(
        "data-theme",
        profile.settings.theme
      );
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-500">
        <div className="relative group mb-4">
          <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-2xl rounded-full group-hover:opacity-30 transition-opacity" />
          <img
            src={HeroIcon}
            alt="Calorie Quest Logo"
            className="w-24 h-24 md:w-32 md:h-32 relative z-10 drop-shadow-2xl"
          />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">
          Calorie<span className="text-blue-600">Quest</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-800 opacity-60 tracking-[0.3em] uppercase mb-8">
          Level up your health
        </p>

        <button
          onClick={async () => {
            try {
              await signInWithGoogle();
            } catch (error) {
              console.error("Login failed:", error);
              alert("Failed to sign in. Make sure Google Auth is enabled!");
            }
          }}
          className="bg-white border border-slate-200 px-8 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!profile) {
    return <OnboardingWizard />;
  }

  // Corrected Handlers: They talk to the DB, not local state
  const handleAddWater = async (amount: number, unit: WaterUnit) => {
    try {
      await logWaterToDb(profile.uid, amount, unit);
    } catch (err) {
      console.error("Failed to log water:", err);
    }
  };

  const handleAddFood = async (food: FoodEntry, countsAsHydration: boolean) => {
    try {
      await logFoodToDb(profile.uid, food);
      if (!countsAsHydration) setIsAddOpen(false);
    } catch (err) {
      console.error("Failed to log food:", err);
    }
  };

  const handleAddExercise = async (name: string, minutes: number) => {
    try {
      // You'll need to create this utility function in your db.ts
      await logExerciseToDb(profile.uid, name, minutes);
    } catch (err) {
      console.error("Failed to log exercise:", err);
    }
  };

  const handleAddWeight = async (weight: number, unit: "lbs" | "kg") => {
    try {
      await logWeightToDb(profile.uid, weight, unit);
      // You might want to show a toast or notification here
    } catch (err) {
      console.error("Failed to log weight:", err);
    }
  };

  // --- MAIN APP NAVIGATION ---
  return (
    /* Use h-[100dvh] to handle mobile browser bars and navigation accurately */
    <div className="h-[100dvh] w-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden">
      {/* PERSISTENT HEADER stays at the top */}
      <AppHeader profile={profile} />

      {/* DYNAMIC CONTENT AREA - flex-1 ensures it takes all space between header and footer */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
        {currentView === "home" && <HomeView profile={profile} />}
        {currentView === "stats" && <StatsPage profile={profile} />}
        {currentView === "quest" && <QuestView />}
        {currentView === "shop" && <ShopView />}
      </main>

      {/* PERSISTENT BOTTOM NAV stays at the bottom */}
      <BottomNav
        activeTab={currentView}
        onNavigate={setCurrentView}
        onAddClick={() => setIsAddOpen(true)}
      />

      {/* PERSISTENT DRAWERS - These sit on top of everything else */}
      <AddEntryDrawer
        isOpen={isAddOpen}
        uid={profile.uid}
        onClose={() => setIsAddOpen(false)}
        onAddWater={handleAddWater}
        onAddFood={handleAddFood}
        onAddExercise={handleAddExercise}
        onAddWeight={handleAddWeight}
        theme={profile.settings.theme}
      />
    </div>
  );
}
export default App;

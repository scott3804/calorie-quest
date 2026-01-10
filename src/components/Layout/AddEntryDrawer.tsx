import React, { useEffect, useState } from "react";
import {
  X,
  Utensils,
  Droplets,
  Scale,
  ArrowLeft,
  Zap,
  Footprints,
  Dumbbell,
  Star,
  Search,
} from "lucide-react";
import type { FoodEntry, ThemeOptions, WaterUnit } from "../../types";
import { useFoodLibrary } from "../../hooks/useFoodLibrary";
import {
  saveCustomFoodDefinition,
  updateFoodFavoriteStatus,
} from "../../utils/db";
import { getLocalTodayString } from "../../utils/dateUtils";

interface Props {
  isOpen: boolean;
  uid: string;
  onClose: () => void;
  onAddWater: (amount: number, unit: WaterUnit) => void;
  onAddFood: (food: FoodEntry, countsAsHydration: boolean) => void;
  onAddExercise: (activity: string, minutes: number) => void;
  onAddWeight: (weight: number, unit: "lbs" | "kg") => void;
  theme: ThemeOptions;
}

export const AddEntryDrawer = ({
  isOpen,
  uid,
  onClose,
  onAddWater,
  onAddFood,
  onAddExercise,
  onAddWeight,
  theme,
}: Props) => {
  const [activeTab, setActiveTab] = useState<
    | "options"
    | "food"
    | "weight"
    | "exercise"
    | "customFood"
    | "water"
    | "foodQuantity"
  >("options");
  const [search, setSearch] = useState("");
  const [returnTab, setReturnTab] = useState<"food" | "customFood">("food");

  const [selectedFood, setSelectedFood] = useState<FoodEntry | null>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);

  // Local state for the custom food form
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodKcal, setCustomFoodKcal] = useState("");
  const [countsAsHydration, setCountsAsHydration] = useState(false);
  const [isLiquidDefault, setIsLiquidDefault] = useState(false);

  // State for the selected activity and duration
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [exerciseTime, setExerciseTime] = useState("30");

  // State for weight logging
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs"); // Default to lbs

  // Assuming you use a hook like useFoodLibrary(uid)
  const { foodLibrary, favorites } = useFoodLibrary(uid);

  const filteredFoods = foodLibrary.filter((f: FoodEntry) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setActiveTab("options");
        setSearch("");
        setCustomFoodName("");
        setCustomFoodKcal("");
        setSelectedFood(null);
        setFoodQuantity(1);
        setSelectedActivity(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSaveProcess = async (type: "log" | "save" | "favorite") => {
    if (!customFoodName || !customFoodKcal) return;

    const foodId = `food-${Date.now()}`;
    const newEntry: FoodEntry = {
      id: foodId,
      name: customFoodName,
      calories: Number(customFoodKcal),
      timestamp: getLocalTodayString(),
      isFavorite: type === "favorite",
    };

    try {
      // If it's a permanent addition, save to the library first
      if (type === "save" || type === "favorite") {
        await saveCustomFoodDefinition(uid, {
          name: newEntry.name,
          calories: newEntry.calories,
          isFavorite: newEntry.isFavorite,
        });
      }

      // Instead of logging and closing, pass it to the quantity step
      setSelectedFood(newEntry);
      setFoodQuantity(1);
      setReturnTab("customFood");
      setActiveTab("foodQuantity");
    } catch (err) {
      console.error("Failed to process fuel discovery:", err);
    }
  };

  const toggleFavorite = async (food: FoodEntry) => {
    try {
      // We pass the uid from our new prop, the food's unique ID,
      // and the opposite of its current favorite status.
      await updateFoodFavoriteStatus(uid, food.id, !food.isFavorite);
    } catch (err) {
      console.error("Failed to update favorite status:", err);
    }
  };

  // Wrap the existing handlers to also close the menu
  const handleExerciseClick = (name: string, minutes: number) => {
    onAddExercise(name, minutes);
    onClose();
  };

  const handleWaterClick = (amt: number, unit: WaterUnit) => {
    onAddWater(amt, unit);
    onClose();
  };

  const handleFoodClick = (food: FoodEntry) => {
    setSelectedFood(food);
    setFoodQuantity(1);
    setCountsAsHydration(false);
    setReturnTab("food");
    setActiveTab("foodQuantity");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      {/* Overlay stays simple */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Container: No more 'animate-in' or 'slide-in' */}
      <div
        className="relative w-full max-w-md bg-[var(--bg-card)] rounded-t-[2.5rem] 
                    p-8 pt-12 shadow-2xl border-t-4 border-black/10 
                    max-h-[92dvh] overflow-y-auto pb-safe"
      >
        {/* Close Button - Moved slightly up/right to clear the options */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-[var(--text-primary)] opacity-40 hover:opacity-100 transition-opacity z-50"
        >
          <X size={24} />
        </button>
        {activeTab === "options" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black mb-8 text-center uppercase tracking-tighter text-[var(--text-primary)]">
              Hero's Log
            </h3>
            {/* 2x2 Grid for easier tapping */}
            <div className="grid grid-cols-2 gap-4">
              <ActionButton
                theme={theme}
                icon={<Utensils size={32} />}
                label="Food"
                subLabel="Health Orb"
                // Red for Food
                customColor="rgba(239, 68, 68, 0.2)"
                iconColor="text-red-500"
                onClick={() => setActiveTab("food")}
              />
              <ActionButton
                theme={theme}
                icon={<Droplets size={32} />}
                label="Water"
                subLabel="Mana Orb"
                // Blue for Water
                customColor="rgba(59, 130, 246, 0.2)"
                iconColor="text-blue-500"
                onClick={() => setActiveTab("water")}
              />
              <ActionButton
                theme={theme}
                icon={<Zap size={32} />} // Using Zap for Exercise/Stamina
                label="Exercise"
                subLabel="Stamina Bar"
                // Yellow for Exercise
                customColor="rgba(234, 179, 8, 0.2)"
                iconColor="text-yellow-500"
                onClick={() => setActiveTab("exercise")}
              />
              <ActionButton
                theme={theme}
                icon={<Scale size={32} />}
                label="Weight"
                subLabel="Hero Stats"
                // Green for Weight/Progress
                customColor="rgba(34, 197, 94, 0.2)"
                iconColor="text-green-500"
                onClick={() => setActiveTab("weight")}
              />
            </div>
          </div>
        )}
        {activeTab === "food" && (
          <div className="animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setActiveTab("options")}
                className="p-2 text-[var(--text-primary)]"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                  size={18}
                />
                <input
                  autoFocus
                  className="w-full bg-black/5 border-2 border-black/10 rounded-xl py-2 pl-10 pr-4 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  placeholder="Search fuel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {favorites.length > 0 && search === "" && (
              <div className="mb-6">
                <p className="text-[10px] font-black opacity-40 uppercase mb-2 tracking-widest">
                  Favorites
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {favorites.map((food: FoodEntry) => (
                    <button
                      key={food.id}
                      onClick={() => handleFoodClick(food)}
                      className="flex-shrink-0 px-4 py-2 bg-[var(--accent)]/10 border-2 border-[var(--accent)] rounded-xl text-[var(--accent)] font-black text-xs uppercase"
                    >
                      {food.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredFoods.map((food: FoodEntry) => (
                <div key={food.id} className="relative group">
                  <button
                    onClick={() => handleFoodClick(food)}
                    className="w-full flex justify-between items-center p-4 bg-black/5 hover:bg-black/10 rounded-2xl border-2 border-transparent active:border-[var(--accent)] transition-all"
                  >
                    <div className="text-left">
                      <p className="font-black text-sm uppercase text-[var(--text-primary)]">
                        {food.name}
                      </p>
                      <p className="text-[10px] opacity-40 font-black">
                        {food.calories} KCAL
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(food);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-20 hover:opacity-100"
                  >
                    <Star
                      size={18}
                      fill={food.isFavorite ? "var(--accent)" : "none"}
                      className={food.isFavorite ? "text-[var(--accent)]" : ""}
                    />
                  </button>
                </div>
              ))}

              {/* If search returns nothing, show the 'Register New' button */}
              {filteredFoods.length === 0 && (
                <button
                  onClick={() => {
                    setCustomFoodName(search);
                    setActiveTab("customFood");
                  }}
                  className="w-full p-6 border-2 border-dashed ..."
                >
                  + Register "{search}" as New Fuel
                </button>
              )}
            </div>
          </div>
        )}
        {activeTab === "customFood" && (
          <div className="space-y-4 animate-in slide-in-from-right">
            <h3 className="text-lg font-black uppercase text-[var(--text-primary)]">
              Identify Fuel
            </h3>

            <input
              type="text"
              placeholder="Name (e.g. Elven Bread)"
              className="w-full bg-black/5 p-4 rounded-2xl border-2 border-black/10 text-[var(--text-primary)]"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
            />

            <input
              type="number"
              placeholder="KCAL"
              className="w-full bg-black/5 p-4 rounded-2xl border-2 border-black/10 text-[var(--text-primary)]"
              value={customFoodKcal}
              onChange={(e) => setCustomFoodKcal(e.target.value)}
            />

            <label className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={isLiquidDefault} // New state variable
                onChange={(e) => setIsLiquidDefault(e.target.checked)}
              />
              <span className="text-xs font-bold text-blue-600 uppercase">
                Always count as hydration
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2 mt-4">
              {/* Option 1: Log only */}
              <button
                onClick={() => handleSaveProcess("log")}
                className="py-3 px-4 rounded-xl border-2 border-black/10 text-[var(--text-primary)] text-xs font-black uppercase opacity-60 hover:opacity-100"
              >
                Log One-Time
              </button>

              {/* Option 2: Save to Library */}
              <button
                onClick={() => handleSaveProcess("save")}
                className="py-4 px-4 rounded-xl border-2 border-[var(--accent)] text-[var(--accent)] text-sm font-black uppercase bg-[var(--accent)]/5"
              >
                Save to Library & Log
              </button>

              {/* Option 3: Favorite */}
              <button
                onClick={() => handleSaveProcess("favorite")}
                className="py-4 px-4 rounded-xl bg-[var(--accent)] text-[var(--bg-main)] text-sm font-black uppercase shadow-lg active:scale-95 transition-all"
              >
                ⭐ Favorite & Log
              </button>
            </div>
          </div>
        )}
        {activeTab === "foodQuantity" && selectedFood && (
          <div className="space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-4 mb-4">
              <button
                // Ensure this goes back to the right place based on where they came from
                onClick={() =>
                  setActiveTab(returnTab || search ? "food" : "options")
                }
                className="p-2 text-[var(--text-primary)]"
              >
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tighter flex-1 text-center text-[var(--text-primary)]">
                Adjust Quantity
              </h3>
            </div>

            {/* Food Info Card */}
            <div className="text-center p-6 bg-black/5 rounded-[2rem] border-2 border-dashed border-black/10">
              <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">
                Scaling Fuel
              </p>
              <h4 className="text-2xl font-black uppercase text-[var(--text-primary)] mb-1 leading-tight">
                {selectedFood.name}
              </h4>
              <p className="text-sm font-bold text-[var(--accent)]">
                {selectedFood.calories} KCAL BASE
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex justify-center items-end gap-4 py-6">
              {/* Minus 0.5 Button */}
              <button
                onClick={() => setFoodQuantity(Math.max(0, foodQuantity - 0.5))}
                className="w-14 h-14 rounded-2xl bg-black/5 border-2 border-black/10 flex items-center justify-center text-2xl font-black text-[var(--text-primary)] active:scale-90 transition-all pb-1"
              >
                -
              </button>

              {/* Styled Decimal Input */}
              <div className="text-center flex flex-col items-center">
                <input
                  type="number"
                  name="food-quantity"
                  id="food-quantity"
                  min={0}
                  step={0.1}
                  //Prevents mouse wheel from changing number while scrolling page
                  onWheel={(e) => e.currentTarget.blur()}
                  value={foodQuantity}
                  onChange={(e) => {
                    // Parse float to handle decimals, ensure it doesn't break on empty string
                    const val = parseFloat(e.target.value);
                    if (isNaN(val) || val < 0) {
                      // Don't set to 0 immediately on empty string to allow typing,
                      // but protect negative. You might want to handle empty string specifically if needed.
                      // if (e.target.value === "") return;
                      setFoodQuantity(0);
                    } else {
                      setFoodQuantity(val);
                    }
                  }}
                  // TAILWIND STYLING HERE:
                  className="bg-transparent text-5xl font-black text-center w-[140px] outline-none border-b-4 border-black/10 focus:border-[var(--accent)] text-[var(--text-primary)] transition-colors pb-1"
                />
                <label
                  htmlFor="food-quantity"
                  className="text-[10px] font-black opacity-40 uppercase tracking-tighter mt-2"
                >
                  Multiplier
                </label>
              </div>

              {/* Plus 0.5 Button */}
              <button
                onClick={() => setFoodQuantity(foodQuantity + 0.5)}
                className="w-14 h-14 rounded-2xl bg-black/5 border-2 border-black/10 flex items-center justify-center text-2xl font-black text-[var(--text-primary)] active:scale-90 transition-all pb-1"
              >
                +
              </button>
            </div>

            <label className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border-2 border-blue-500/20 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={countsAsHydration}
                onChange={(e) => setCountsAsHydration(e.target.checked)}
                className="w-5 h-5 accent-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-black text-blue-600 uppercase">
                  Liquid Fuel
                </p>
                <p className="text-[10px] font-bold opacity-60 uppercase">
                  Count this as hydration?
                </p>
              </div>
            </label>

            {/* Final Consume Button */}
            <button
              onClick={() => {
                // Ensure we don't log 0 or NaN quantity
                const finalQuantity = foodQuantity || 1;

                onAddFood(
                  {
                    ...selectedFood,
                    id: `${selectedFood.id}-${Date.now()}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`,
                    calories: Math.round(selectedFood.calories * finalQuantity),
                    timestamp: new Date().toISOString(),
                  },
                  countsAsHydration
                );

                if (countsAsHydration) {
                  setActiveTab("water"); // Immediately pop up the water entry
                } else {
                  onClose();
                }
              }}
              // Disable if quantity is effectively zero
              disabled={!foodQuantity || foodQuantity <= 0}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Consume {Math.round(selectedFood.calories * (foodQuantity || 0))}{" "}
              KCAL
            </button>
          </div>
        )}
        {activeTab === "water" && <WaterTab onAdd={handleWaterClick} />}
        {activeTab === "exercise" && (
          <div className="animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() =>
                  selectedActivity
                    ? setSelectedActivity(null)
                    : setActiveTab("options")
                }
                className="text-[var(--text-primary)]"
              >
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tighter flex-1 text-center text-[var(--text-primary)]">
                {selectedActivity
                  ? `Logging ${selectedActivity}`
                  : "Hero Training"}
              </h3>
            </div>

            {!selectedActivity ? (
              /* STEP 1: Choose Activity */
              <div className="grid grid-cols-3 gap-3">
                <ExerciseButton
                  theme={theme}
                  icon={<Footprints size={24} />}
                  label="Walk"
                  onClick={() => setSelectedActivity("Walk")}
                />
                <ExerciseButton
                  theme={theme}
                  icon={<Zap size={24} />}
                  label="Cardio"
                  onClick={() => setSelectedActivity("Cardio")}
                />
                <ExerciseButton
                  theme={theme}
                  icon={<Dumbbell size={24} />}
                  label="Weights"
                  onClick={() => setSelectedActivity("Weights")}
                />
              </div>
            ) : (
              /* STEP 2: Enter Duration */
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-[var(--text-primary)] opacity-60 text-xs font-bold uppercase mb-2">
                    Duration (Minutes)
                  </p>
                  <input
                    type="number"
                    value={exerciseTime}
                    onChange={(e) => setExerciseTime(e.target.value)}
                    className="text-5xl font-black bg-transparent text-center w-full outline-none text-[var(--accent)]"
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => {
                    handleExerciseClick(selectedActivity, Number(exerciseTime));
                    onClose();
                  }}
                  className="w-full py-4 bg-[var(--accent)] text-[var(--bg-main)] font-black rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  CONFIRM TRAINING
                </button>
              </div>
            )}
          </div>
        )}
        {activeTab === "weight" && (
          <div className="space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 bg-green-500 rounded-2xl text-white shadow-lg shadow-green-500/20 mb-2">
                <Scale size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">
                Hero Weight
              </h3>
            </div>

            <div className="bg-black/5 p-6 rounded-[2rem] border border-[var(--text-primary)]/10">
              <div className="flex gap-4 items-end justify-center mb-6">
                <div className="flex flex-col items-center">
                  <input
                    autoFocus
                    type="number"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-5xl font-black text-center w-32 outline-none border-b-4 border-black/10 focus:border-green-500 text-[var(--text-primary)] transition-colors"
                  />
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-2">
                    Current Weight
                  </span>
                </div>

                {/* Unit Toggle */}
                <button
                  onClick={() =>
                    setWeightUnit(weightUnit === "lbs" ? "kg" : "lbs")
                  }
                  className="bg-[var(--bg-main)] px-4 py-2 rounded-xl font-black text-sm uppercase border-2 border-[var(--text-primary)]/10 text-green-600 active:scale-95"
                >
                  {weightUnit}
                </button>
              </div>

              <button
                disabled={!weightValue || parseFloat(weightValue) <= 0}
                onClick={async () => {
                  // This calls the prop we will add in App.tsx
                  await onAddWeight(parseFloat(weightValue), weightUnit);
                  onClose();
                }}
                className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase shadow-lg shadow-green-500/20 active:scale-95 transition-all disabled:opacity-30"
              >
                Record Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({
  icon,
  label,
  subLabel,
  onClick,
  customColor,
  iconColor,
  theme, // Add theme prop
}: {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  onClick: () => void;
  customColor: string;
  iconColor: string;
  theme: string;
}) => {
  // If retro, we force the background to be neutral and the icon to be the text-primary color
  const isRetro = theme === "retro";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden active:scale-95
        ${
          isRetro
            ? "bg-transparent border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)]"
            : "bg-black/5 border-transparent active:border-[var(--accent)]"
        }`}
    >
      {/* Colored glow only for non-retro */}
      {!isRetro && (
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: customColor }}
        />
      )}

      <div
        className={`p-4 rounded-2xl shadow-inner mb-2 z-10 transition-colors
        ${
          isRetro
            ? "bg-black/10 text-[var(--text-primary)]"
            : `bg-[var(--bg-main)] ${iconColor}`
        }`}
      >
        {icon}
      </div>

      <span className="text-xs font-black uppercase tracking-tighter text-[var(--text-primary)] z-10">
        {label}
      </span>
      <span className="text-[8px] font-bold uppercase opacity-40 text-[var(--text-primary)] z-10 tracking-widest">
        {subLabel}
      </span>
    </button>
  );
};

const ExerciseButton = ({
  icon,
  label,
  onClick,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  theme: string;
}) => {
  const isRetro = theme === "retro";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[2rem] border-2 transition-all active:scale-95 group relative overflow-hidden
        ${
          isRetro
            ? "bg-transparent border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)]"
            : "bg-black/5 border-transparent hover:border-yellow-500/50 shadow-lg"
        }`}
    >
      {/* Yellow glow for Stamina - only in non-retro */}
      {!isRetro && (
        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div
        className={`p-4 rounded-2xl shadow-inner mb-1 z-10 transition-colors
        ${
          isRetro
            ? "bg-black/10 text-[var(--text-primary)]"
            : "bg-[var(--bg-main)] text-yellow-600"
        }`}
      >
        {icon}
      </div>

      <div className="text-center z-10">
        <p className="text-xs font-black uppercase tracking-tighter text-[var(--text-primary)]">
          {label}
        </p>
      </div>
    </button>
  );
};

const WaterTab = ({
  onAdd,
}: {
  onAdd: (amt: number, unit: WaterUnit) => void;
}) => {
  const [customValue, setCustomValue] = useState("");
  const [unit, setUnit] = useState<WaterUnit>("oz");

  const presets = [
    { label: "Glass", oz: 8, ml: 250 },
    { label: "Large", oz: 12, ml: 350 },
    { label: "Tall", oz: 16, ml: 475 },
    { label: "Bottle", oz: 20, ml: 600 },
    { label: "The Jug", oz: 32, ml: 1000 },
    { label: "The Tank", oz: 40, ml: 1200 },
  ];

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-200">
      {/* 1. COMPACT HEADER: Centralized Icon */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-1">
          <Droplets size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--text-primary)]">
          Hydration Presets
        </p>
      </div>

      {/* 2. PRESET GRID: Space-optimized buttons */}
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onAdd(unit === "oz" ? p.oz : p.ml, unit)}
            className="flex flex-col items-center justify-center py-3 bg-blue-500/10 border-2 border-blue-500/10 rounded-xl active:scale-95 transition-all group hover:border-blue-500/50"
          >
            <p className="font-black text-xs uppercase text-[var(--text-primary)] leading-none mb-1">
              {p.label}
            </p>
            <p className="text-[10px] font-bold opacity-50 uppercase text-[var(--text-primary)]">
              {p.oz} oz / {p.ml} ml
            </p>
          </button>
        ))}
      </div>

      {/* 3. CUSTOM INPUT */}
      <div className="bg-black/5 p-4 rounded-3xl border border-[var(--text-primary)]/10">
        <label className="text-[10px] font-black opacity-40 uppercase mb-2 block text-[var(--text-primary)]">
          Custom Amount
        </label>
        <div className="flex gap-2 items-stretch">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`Enter ${unit}...`}
            className="min-w-0 flex-1 bg-black/10 p-3 rounded-xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all text-[var(--text-primary)]"
          />
          <button
            onClick={() => setUnit(unit === "oz" ? "ml" : "oz")}
            className="w-14 bg-[var(--bg-main)] text-[var(--text-primary)] rounded-xl font-black text-xs uppercase border-2 border-[var(--text-primary)]/10 active:scale-95 shrink-0"
          >
            {unit}
          </button>
        </div>
        <button
          disabled={!customValue}
          onClick={() => {
            onAdd(Number(customValue), unit);
            setCustomValue("");
          }}
          className="w-full mt-3 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-sm disabled:opacity-30 active:scale-[0.98] transition-all shadow-lg"
        >
          Add Custom
        </button>
      </div>
    </div>
  );
};

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
  Pencil,
} from "lucide-react";
import type {
  FoodDefinition,
  FoodLogEntry,
  ThemeOptions,
  WaterUnit,
} from "../../types";
import { useFoodLibrary } from "../../hooks/useFoodLibrary";
import {
  deleteFoodFromLibrary,
  saveCustomFoodDefinition,
  updateFoodDefinition,
  updateFoodFavoriteStatus,
} from "../../utils/db";

interface Props {
  isOpen: boolean;
  uid: string;
  onClose: () => void;
  onAddWater: (amount: number, unit: WaterUnit) => void;
  onAddFood: (food: FoodLogEntry, countsAsHydration: boolean) => void;
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

  const [selectedFood, setSelectedFood] = useState<FoodDefinition | null>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);

  // Local state for the custom food form
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodKcal, setCustomFoodKcal] = useState("");
  const [countsAsHydration, setCountsAsHydration] = useState(false);
  const [isLiquidDefault, setIsLiquidDefault] = useState(false);
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [editingFoodId, setEditingFoodId] = useState("");

  // State for the selected activity and duration
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [exerciseTime, setExerciseTime] = useState("30");

  // State for weight logging
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");

  const { foodLibrary, favorites } = useFoodLibrary(uid);

  const filteredFoods = foodLibrary.filter((f: FoodDefinition) =>
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
        setEditingFoodId("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSaveProcess = async (type: "log" | "save" | "favorite") => {
    if (!customFoodName || !customFoodKcal) return;

    const foodData: Omit<FoodDefinition, "id"> = {
      name: customFoodName,
      calories: Number(customFoodKcal),
      isFavorite: type === "favorite",
      isLiquid: isLiquidDefault,
      protein: protein ? Number(protein) : 0,
      carbs: carbs ? Number(carbs) : 0,
      fat: fat ? Number(fat) : 0,
    };

    try {
      if (editingFoodId) {
        await updateFoodDefinition(uid, editingFoodId, foodData);
        setEditingFoodId("");
        setActiveTab("food");
        return;
      }

      let finalFoodId = `temp-${Date.now()}`;
      if (type === "save" || type === "favorite") {
        const res = await saveCustomFoodDefinition(uid, foodData);
        finalFoodId = res.id;
      }

      setSelectedFood({ ...foodData, id: finalFoodId });
      setFoodQuantity(1);
      setCountsAsHydration(isLiquidDefault);
      setReturnTab("customFood");
      setActiveTab("foodQuantity");
    } catch (err) {
      console.error("Failed to process fuel discovery:", err);
    }
  };

  const toggleFavorite = async (food: FoodDefinition) => {
    try {
      await updateFoodFavoriteStatus(uid, food.id, !food.isFavorite);
    } catch (err) {
      console.error("Failed to update favorite status:", err);
    }
  };

  const handleEditClick = (food: FoodDefinition) => {
    setCustomFoodName(food.name);
    setCustomFoodKcal(food.calories.toString());
    setProtein(food.protein?.toString() || "");
    setCarbs(food.carbs?.toString() || "");
    setFat(food.fat?.toString() || "");
    setIsLiquidDefault(food.isLiquid);
    setEditingFoodId(food.id);
    setActiveTab("customFood");
  };

  const handleWaterClick = (amt: number, unit: WaterUnit) => {
    onAddWater(amt, unit);
    onClose();
  };

  const handleFoodClick = (food: FoodDefinition) => {
    setSelectedFood(food);
    setFoodQuantity(1);
    setCountsAsHydration(food.isLiquid || false);
    setReturnTab("food");
    setActiveTab("foodQuantity");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container: Flexbox split for Keyboard & Alignment */}
      <div
        className="relative w-full max-w-md bg-[var(--bg-card)] rounded-t-[2.5rem] 
                      shadow-2xl border-t-4 border-black/10 
                      max-h-[92dvh] flex flex-col overflow-hidden"
      >
        {/* 1. FIXED HEADER: Stays visible above keyboard */}
        <div className="pt-10 px-8 pb-4 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-6 text-[var(--text-primary)] opacity-40 hover:opacity-100 transition-opacity z-50"
          >
            <X size={24} />
          </button>

          {/* Dynamic Header Content */}
          {activeTab === "options" && (
            <h3 className="text-2xl font-black text-center uppercase tracking-tighter text-[var(--text-primary)]">
              Hero's Log
            </h3>
          )}

          {activeTab === "food" && (
            <div className="flex items-center gap-4">
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
                  placeholder={`e.g. "Turkey - 56g"`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "water" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("options")}
                className="text-[var(--text-primary)]"
              >
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tighter flex-1 text-center text-[var(--text-primary)]">
                Mana Presets
              </h3>
            </div>
          )}

          {(activeTab === "exercise" ||
            activeTab === "weight" ||
            activeTab === "foodQuantity" ||
            activeTab === "customFood") && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (activeTab === "foodQuantity") setActiveTab(returnTab);
                  else if (activeTab === "exercise" && selectedActivity)
                    setSelectedActivity(null);
                  else setActiveTab("options");
                }}
                className="text-[var(--text-primary)]"
              >
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tighter flex-1 text-center text-[var(--text-primary)]">
                {activeTab === "exercise"
                  ? selectedActivity
                    ? `Logging ${selectedActivity}`
                    : "Hero Training"
                  : activeTab === "weight"
                  ? "Hero Weight"
                  : activeTab === "customFood"
                  ? "Identify Fuel"
                  : "Adjust Quantity"}
              </h3>
            </div>
          )}
        </div>

        {/* 2. SCROLLABLE CONTENT: This area handles the keyboard resize */}
        <div className="flex-1 overflow-y-auto px-8 pb-safe custom-scrollbar">
          {activeTab === "options" && (
            <div className="grid grid-cols-2 gap-4 pb-8">
              <ActionButton
                theme={theme}
                icon={<Utensils size={32} />}
                label="Food"
                subLabel="Health Orb"
                customColor="rgba(239, 68, 68, 0.2)"
                iconColor="text-red-500"
                onClick={() => setActiveTab("food")}
              />
              <ActionButton
                theme={theme}
                icon={<Droplets size={32} />}
                label="Water"
                subLabel="Mana Orb"
                customColor="rgba(59, 130, 246, 0.2)"
                iconColor="text-blue-500"
                onClick={() => setActiveTab("water")}
              />
              <ActionButton
                theme={theme}
                icon={<Zap size={32} />}
                label="Exercise"
                subLabel="Stamina Bar"
                customColor="rgba(234, 179, 8, 0.2)"
                iconColor="text-yellow-500"
                onClick={() => setActiveTab("exercise")}
              />
              <ActionButton
                theme={theme}
                icon={<Scale size={32} />}
                label="Weight"
                subLabel="Hero Stats"
                customColor="rgba(34, 197, 94, 0.2)"
                iconColor="text-green-500"
                onClick={() => setActiveTab("weight")}
              />
            </div>
          )}

          {activeTab === "food" && (
            <div className="space-y-3 pb-8">
              {favorites.length > 0 && search === "" && (
                <div className="mb-6">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-2 tracking-widest">
                    Favorites
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {favorites.map((food: FoodDefinition) => (
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
              {filteredFoods.map((food: FoodDefinition) => (
                <div key={food.id} className="relative flex items-center group">
                  <button
                    onClick={() => handleFoodClick(food)}
                    className="w-full flex justify-between items-center p-4 pr-24 bg-black/5 hover:bg-black/10 rounded-2xl border-2 border-transparent active:border-[var(--accent)] transition-all"
                  >
                    <div className="text-left">
                      <p className="font-black text-sm uppercase text-[var(--text-primary)] leading-tight">
                        {food.name}
                      </p>
                      <p className="text-[10px] opacity-40 font-black mt-0.5">
                        {food.calories} KCAL
                      </p>
                    </div>
                  </button>
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(food);
                      }}
                      className="p-2 opacity-30 hover:opacity-100 transition-opacity"
                    >
                      <Star
                        size={18}
                        fill={food.isFavorite ? "var(--accent)" : "none"}
                        className={
                          food.isFavorite
                            ? "text-[var(--accent)]"
                            : "text-[var(--text-primary)]"
                        }
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(food);
                      }}
                      className="p-2 text-[var(--text-primary)] opacity-30 hover:opacity-100 transition-opacity"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${food.name}"?`))
                          await deleteFoodFromLibrary(uid, food.id);
                      }}
                      className="p-2 text-red-500 opacity-30 hover:opacity-100 transition-opacity"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {search && filteredFoods.length === 0 && (
                <button
                  onClick={() => {
                    setCustomFoodName(search);
                    setActiveTab("customFood");
                  }}
                  className="w-full p-6 border-2 border-dashed border-black/10 rounded-2xl text-[var(--text-primary)] opacity-40 hover:opacity-100 font-black uppercase text-xs"
                >
                  + Register "{search}" as New Fuel
                </button>
              )}
            </div>
          )}

          {activeTab === "customFood" && (
            <div className="space-y-4 pb-8">
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-black/5 p-4 rounded-2xl border-2 border-black/10 text-[var(--text-primary)] font-bold"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black opacity-40 uppercase ml-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    placeholder="KCAL"
                    className="w-full bg-black/5 p-4 rounded-2xl border-2 border-black/10 text-[var(--text-primary)] font-bold"
                    value={customFoodKcal}
                    onChange={(e) => setCustomFoodKcal(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black opacity-40 uppercase ml-2 text-blue-500">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-blue-500/5 p-4 rounded-2xl border-2 border-blue-500/10 text-[var(--text-primary)] font-bold"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black opacity-40 uppercase ml-2 text-orange-500">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-orange-500/5 p-4 rounded-2xl border-2 border-orange-500/10 text-[var(--text-primary)] font-bold"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black opacity-40 uppercase ml-2 text-yellow-600">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-yellow-500/5 p-4 rounded-2xl border-2 border-yellow-500/10 text-[var(--text-primary)] font-bold"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLiquidDefault}
                  onChange={(e) => setIsLiquidDefault(e.target.checked)}
                />
                <span className="text-xs font-bold text-blue-600 uppercase">
                  Always count as hydration
                </span>
              </label>
              <div className="flex flex-col gap-2 mt-2">
                {editingFoodId ? (
                  <button
                    onClick={() => handleSaveProcess("save")}
                    className="w-full py-4 bg-[var(--accent)] text-[var(--bg-main)] rounded-2xl font-black uppercase shadow-lg"
                  >
                    Update Library Record
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSaveProcess("save")}
                      className="w-full py-4 bg-[var(--accent)] text-[var(--bg-main)] rounded-2xl font-black uppercase shadow-lg"
                    >
                      Save to Library & Log
                    </button>
                    <button
                      onClick={() => handleSaveProcess("log")}
                      className="w-full py-3 border-2 border-black/10 text-[var(--text-primary)] rounded-xl font-black uppercase text-xs opacity-60"
                    >
                      Log One-Time
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setEditingFoodId("");
                    setActiveTab("food");
                  }}
                  className="py-2 text-[10px] font-black uppercase opacity-40"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeTab === "foodQuantity" && selectedFood && (
            <div className="space-y-6 pb-8 text-center">
              <div className="p-6 bg-black/5 rounded-[2rem] border-2 border-dashed border-black/10">
                <h4 className="text-2xl font-black uppercase text-[var(--text-primary)]">
                  {selectedFood.name}
                </h4>
                <p className="text-sm font-bold text-[var(--accent)]">
                  {selectedFood.calories} KCAL BASE
                </p>
              </div>
              <div className="flex justify-center items-end gap-4 py-4">
                <button
                  onClick={() =>
                    setFoodQuantity(Math.max(0, foodQuantity - 0.5))
                  }
                  className="w-14 h-14 rounded-2xl bg-black/5 border-2 border-black/10 text-2xl font-black"
                >
                  -
                </button>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    step={0.1}
                    value={foodQuantity}
                    onChange={(e) =>
                      setFoodQuantity(parseFloat(e.target.value) || 0)
                    }
                    className="bg-transparent text-5xl font-black text-center w-32 outline-none border-b-4 border-black/10 focus:border-[var(--accent)] text-[var(--text-primary)]"
                  />
                  <label className="text-[10px] font-black opacity-40 uppercase mt-2">
                    Multiplier
                  </label>
                </div>
                <button
                  onClick={() => setFoodQuantity(foodQuantity + 0.5)}
                  className="w-14 h-14 rounded-2xl bg-black/5 border-2 border-black/10 text-2xl font-black"
                >
                  +
                </button>
              </div>
              <label className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border-2 border-blue-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={countsAsHydration}
                  onChange={(e) => setCountsAsHydration(e.target.checked)}
                  className="w-5 h-5 accent-blue-500"
                />
                <span className="text-sm font-black text-blue-600 uppercase">
                  Count as Mana?
                </span>
              </label>
              <button
                onClick={() =>
                  onAddFood(
                    {
                      ...selectedFood,
                      multiplier: foodQuantity,
                      totalCalories: Math.round(
                        selectedFood.calories * foodQuantity
                      ),
                      protein: Math.round(
                        (selectedFood.protein || 0) * foodQuantity
                      ),
                      carbs: Math.round(
                        (selectedFood.carbs || 0) * foodQuantity
                      ),
                      fat: Math.round((selectedFood.fat || 0) * foodQuantity),
                      timestamp: new Date().toISOString(),
                    },
                    countsAsHydration
                  )
                }
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase shadow-lg"
              >
                Consume {Math.round(selectedFood.calories * foodQuantity)} KCAL
              </button>
            </div>
          )}

          {activeTab === "water" && <WaterTab onAdd={handleWaterClick} />}

          {activeTab === "exercise" && (
            <div className="pb-8">
              {!selectedActivity ? (
                <div className="grid grid-cols-3 gap-3">
                  <ExerciseButton
                    theme={theme}
                    icon={<Footprints />}
                    label="Walk"
                    onClick={() => setSelectedActivity("Walk")}
                  />
                  <ExerciseButton
                    theme={theme}
                    icon={<Zap />}
                    label="Cardio"
                    onClick={() => setSelectedActivity("Cardio")}
                  />
                  <ExerciseButton
                    theme={theme}
                    icon={<Dumbbell />}
                    label="Weights"
                    onClick={() => setSelectedActivity("Weights")}
                  />
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <input
                    type="number"
                    value={exerciseTime}
                    onChange={(e) => setExerciseTime(e.target.value)}
                    className="text-5xl font-black bg-transparent text-center w-full outline-none text-[var(--accent)]"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onAddExercise(selectedActivity, Number(exerciseTime));
                      onClose();
                    }}
                    className="w-full py-4 bg-[var(--accent)] text-[var(--bg-main)] font-black rounded-2xl shadow-lg"
                  >
                    CONFIRM TRAINING
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "weight" && (
            <div className="space-y-6 pb-8 text-center">
              <div className="bg-black/5 p-6 rounded-[2rem] border border-[var(--text-primary)]/10">
                <div className="flex gap-4 items-end justify-center mb-6">
                  <div className="flex flex-col">
                    <input
                      autoFocus
                      type="number"
                      value={weightValue}
                      onChange={(e) => setWeightValue(e.target.value)}
                      placeholder="0.0"
                      className="bg-transparent text-5xl font-black text-center w-32 outline-none border-b-4 border-black/10 focus:border-green-500 text-[var(--text-primary)]"
                    />
                    <span className="text-[10px] font-black opacity-40 mt-2 uppercase">
                      Weight
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setWeightUnit(weightUnit === "lbs" ? "kg" : "lbs")
                    }
                    className="bg-[var(--bg-main)] px-4 py-2 rounded-xl font-black text-sm border-2 border-[var(--text-primary)]/10 text-green-600"
                  >
                    {weightUnit}
                  </button>
                </div>
                <button
                  disabled={!weightValue}
                  onClick={() => {
                    onAddWeight(parseFloat(weightValue), weightUnit);
                    onClose();
                  }}
                  className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase"
                >
                  Record Progress
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ActionButton = ({
  icon,
  label,
  subLabel,
  onClick,
  customColor,
  iconColor,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  onClick: () => void;
  customColor: string;
  iconColor: string;
  theme: string;
}) => {
  const isRetro = theme === "retro";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-6 rounded-[2rem] border-2 transition-all active:scale-95 group relative overflow-hidden ${
        isRetro
          ? "bg-transparent border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)]"
          : "bg-black/5 border-transparent active:border-[var(--accent)]"
      }`}
    >
      {!isRetro && (
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: customColor }}
        />
      )}
      <div
        className={`p-4 rounded-2xl shadow-inner mb-2 z-10 ${
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
      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[2rem] border-2 transition-all active:scale-95 group relative overflow-hidden ${
        isRetro
          ? "bg-transparent border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)]"
          : "bg-black/5 border-transparent hover:border-yellow-500/50 shadow-lg"
      }`}
    >
      <div
        className={`p-4 rounded-2xl shadow-inner mb-1 z-10 ${
          isRetro
            ? "bg-black/10 text-[var(--text-primary)]"
            : "bg-[var(--bg-main)] text-yellow-600"
        }`}
      >
        {icon}
      </div>
      <p className="text-xs font-black uppercase tracking-tighter text-[var(--text-primary)] z-10">
        {label}
      </p>
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
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onAdd(unit === "oz" ? p.oz : p.ml, unit)}
            className="flex flex-col items-center justify-center py-3 bg-blue-500/10 border-2 border-blue-500/10 rounded-xl active:scale-95 group hover:border-blue-500/50"
          >
            <p className="font-black text-xs uppercase text-[var(--text-primary)]">
              {p.label}
            </p>
            <p className="text-[10px] font-bold opacity-50 uppercase text-[var(--text-primary)]">
              {p.oz} oz / {p.ml} ml
            </p>
          </button>
        ))}
      </div>
      <div className="bg-black/5 p-4 rounded-3xl border border-[var(--text-primary)]/10 flex gap-2">
        <input
          type="number"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter ${unit}...`}
          className="flex-1 bg-black/10 p-3 rounded-xl font-bold outline-none text-[var(--text-primary)]"
        />
        <button
          onClick={() => setUnit(unit === "oz" ? "ml" : "oz")}
          className="w-14 bg-[var(--bg-main)] text-[var(--text-primary)] rounded-xl font-black text-xs border-2 border-[var(--text-primary)]/10"
        >
          {unit}
        </button>
        <button
          disabled={!customValue}
          onClick={() => onAdd(Number(customValue), unit)}
          className="px-6 bg-blue-600 text-white rounded-xl font-black uppercase text-xs"
        >
          Add
        </button>
      </div>
    </div>
  );
};

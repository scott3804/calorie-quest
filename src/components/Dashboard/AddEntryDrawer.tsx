import React, { useState } from "react";
import { X, Utensils, Droplets, Scale, Search, Plus } from "lucide-react";
import type { FoodEntry } from "../../types";

const MOCK_FOODS: FoodEntry[] = [
  {
    id: "1",
    name: "Chicken Breast (100g)",
    calories: 165,
    timestamp: Date.now(),
  },
  { id: "2", name: "Brown Rice (1 cup)", calories: 215, timestamp: Date.now() },
  { id: "3", name: "Greek Yogurt", calories: 100, timestamp: Date.now() },
];

// Inside the 'food' tab of your drawer, add a filter:

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddWater: (amount: number) => void;
  onAddFood: (food: FoodEntry) => void;
}

export const AddEntryDrawer = ({
  isOpen,
  onClose,
  onAddWater,
  onAddFood,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"options" | "food" | "weight">(
    "options"
  );
  const [search, setSearch] = useState("");
  const filteredFoods = MOCK_FOODS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-slate-500 hover:text-white"
        >
          <X size={24} />
        </button>

        {activeTab === "options" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black mb-6 text-center">Log Action</h3>
            <div className="grid grid-cols-3 gap-4">
              <ActionButton
                icon={<Utensils className="text-orange-400" />}
                label="Food"
                onClick={() => setActiveTab("food")}
              />
              <ActionButton
                icon={<Droplets className="text-blue-400" />}
                label="Water"
                onClick={() => onAddWater(1)}
              />
              <ActionButton
                icon={<Scale className="text-green-400" />}
                label="Weight"
                onClick={() => setActiveTab("weight")}
              />
            </div>
          </div>
        )}

        {activeTab === "food" && (
          <div className="animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  setActiveTab("options");
                  setSearch("");
                }}
                className="text-slate-500 font-bold"
              >
                ←
              </button>
              <h3 className="text-xl font-black text-center flex-1">
                Add Food
              </h3>
            </div>

            <div className="relative mb-6">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                autoFocus
                type="text"
                placeholder="Search frequent foods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            {/* The Results List */}
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      onAddFood(food);
                      setSearch(""); // Reset for next time
                    }}
                    className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-colors group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {food.name}
                      </p>
                      <p className="text-xs text-slate-500 uppercase font-black">
                        {food.calories} kcal
                      </p>
                    </div>
                    <Plus size={18} className="text-slate-500" />
                  </button>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No matches found.</p>
                  <button className="mt-4 text-blue-500 font-bold text-sm">
                    + Create New Custom Food
                  </button>
                </div>
              )}
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-3 bg-slate-800 p-6 rounded-3xl border border-slate-700 active:bg-slate-700 transition-colors"
  >
    <div className="p-3 bg-slate-900 rounded-2xl">{icon}</div>
    <span className="text-xs font-black uppercase tracking-wider">{label}</span>
  </button>
);

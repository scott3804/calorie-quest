// components/Navigation/BottomNav.tsx
import { Home, BarChart2, Plus, Map, ShoppingBag } from "lucide-react";
import type { View } from "../../App";

interface NavProps {
  activeTab: string;
  onNavigate: (view: View) => void;
  onAddClick: () => void;
}

export const BottomNav = ({ activeTab, onNavigate, onAddClick }: NavProps) => {
  return (
    <nav className="px-4 pt-2 pb-8 bg-[var(--bg-card)] border-t border-[var(--text-primary)]/10 flex justify-around items-center relative z-40">
      <NavBtn
        label="Home"
        icon={<Home size={22} />}
        active={activeTab === "home"}
        onClick={() => onNavigate("home")}
      />
      <NavBtn
        label="Stats"
        icon={<BarChart2 size={22} />}
        active={activeTab === "stats"}
        onClick={() => onNavigate("stats")}
      />

      {/* The Central Add Button */}
      <button
        onClick={onAddClick}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[var(--bg-main)] -mt-10 transition-transform active:scale-90"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg-main)" }}
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <NavBtn
        label="Quest"
        icon={<Map size={22} />}
        active={activeTab === "quest"}
        onClick={() => onNavigate("quest")}
      />
      <NavBtn
        label="Shop"
        icon={<ShoppingBag size={22} />}
        active={activeTab === "shop"}
        onClick={() => onNavigate("shop")}
      />
    </nav>
  );
};

const NavBtn = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    className="flex flex-col items-center justify-center py-2 px-1 gap-1.5 transition-all min-w-[64px]"
    style={{
      color: active ? "var(--accent)" : "var(--text-primary)",
      opacity: active ? 1 : 0.6,
    }}
    onClick={onClick}
  >
    <div
      className={`transition-transform ${
        active ? "scale-110 -translate-y-0.5" : "opacity-80"
      }`}
    >
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter leading-none">
      {label}
    </span>
  </button>
);

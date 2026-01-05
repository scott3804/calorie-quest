import { X, Target, LogOut, Palette } from "lucide-react";
import { auth } from "../../firebase";
import type { JSX } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEditAppearance: () => void;
  onEditGoals: () => void;
}

export const SettingsDrawer = ({
  isOpen,
  onClose,
  onEditAppearance,
  onEditGoals,
}: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-80 h-full bg-[var(--bg-card)] shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300 border-l border-black/5">
        <div className="flex justify-between items-center mb-10 text-[var(--text-primary)]">
          <h2 className="text-xl font-black tracking-tighter uppercase">
            Hero Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <SettingsBtn
            icon={<Palette size={20} />}
            label="Style Hero & Theme"
            onClick={onEditAppearance}
          />
          <SettingsBtn
            icon={<Target size={20} />}
            label="Adjust Science Goals"
            onClick={onEditGoals}
          />

          <div className="pt-10 border-t border-black/5 mt-10">
            <button
              onClick={() => auth.signOut()}
              className="w-full flex items-center gap-4 p-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 rounded-2xl transition-all"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ensure the button uses var(--text-primary)
const SettingsBtn = ({
  icon,
  label,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm text-[var(--text-primary)] hover:bg-black/5 active:scale-95"
  >
    <span className="opacity-40">{icon}</span>
    {label}
  </button>
);

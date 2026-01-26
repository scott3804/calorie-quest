import { Coins, CheckCircle2 } from "lucide-react";
import { useDailyLog } from "../../hooks/useDailyLog";
import { claimQuestReward } from "../../utils/db";
import { getLocalTodayString } from "../../utils/dateUtils";
import type { PlayerProfile } from "../../types";

export const QuestView = ({ profile }: { profile: PlayerProfile }) => {
  const today = getLocalTodayString();
  const { log } = useDailyLog(profile.uid, today);

  // 1. Calculate real-time progress for Quests
  const totalProtein = (log?.foods || []).reduce(
    (sum, f) => sum + Number(f.protein || 0),
    0,
  );
  const isProteinGoalMet = totalProtein >= 150;
  const isStaminaGoalMet = (log?.totalExerciseMinutes || 0) >= 30;
  const isWaterGoalMet = (log?.totalWater || 0) >= profile.targetWater;

  const quests = [
    {
      id: "q-protein",
      name: "The Muscle Builder",
      desc: "Consume 150g of Protein",
      progress: totalProtein,
      target: 150,
      reward: 50,
      isMet: isProteinGoalMet,
    },
    {
      id: "q-stamina",
      name: "Overdrive Master",
      desc: "Train for 30+ Minutes",
      progress: log?.totalExerciseMinutes || 0,
      target: 30,
      reward: 25,
      isMet: isStaminaGoalMet,
    },
    {
      id: "q-water",
      name: "Mana Infusion",
      desc: "Hit Daily Hydration Goal",
      progress: log?.totalWater || 0,
      target: profile.targetWater,
      reward: 15,
      isMet: isWaterGoalMet,
    },
  ];

  const handleClaim = async (questId: string, reward: number) => {
    await claimQuestReward(profile.uid, questId, reward);
    // Success will be reflected when the dailyLog hook refreshes
  };

  return (
    <div className="p-6 space-y-6 bg-[var(--bg-main)] min-h-screen">
      <header>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
          Bounties
        </h2>
        <p className="text-[var(--accent)] font-bold text-xs">
          Daily Contracts for Gold
        </p>
      </header>

      <div className="space-y-4">
        {quests.map((q) => {
          const isClaimed = log?.completedQuests?.includes(q.id);

          return (
            <div
              key={q.id}
              className={`p-5 rounded-[2rem] border-2 transition-all ${
                isClaimed
                  ? "bg-black/5 border-transparent opacity-50"
                  : "bg-[var(--bg-card)] border-black/5 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black uppercase text-[var(--text-primary)] leading-none">
                    {q.name}
                  </h4>
                  <p className="text-[10px] font-bold opacity-40 uppercase mt-1">
                    {q.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
                  <Coins size={12} className="text-yellow-600" />
                  <span className="text-xs font-black text-yellow-600">
                    {q.reward}
                  </span>
                </div>
              </div>

              {isClaimed ? (
                <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase">
                  <CheckCircle2 size={14} /> Claimed
                </div>
              ) : (
                <button
                  disabled={!q.isMet}
                  onClick={() => handleClaim(q.id, q.reward)}
                  className={`w-full py-3 rounded-xl font-black uppercase text-xs transition-all ${
                    q.isMet
                      ? "bg-[var(--accent)] text-[var(--bg-main)] shadow-lg shadow-[var(--accent)]/20 active:scale-95"
                      : "bg-black/5 text-[var(--text-primary)] opacity-20 pointer-events-none"
                  }`}
                >
                  {q.isMet
                    ? "Claim Bounty"
                    : `Progress: ${Math.round(q.progress)}/${q.target}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

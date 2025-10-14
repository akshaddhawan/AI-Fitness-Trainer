"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import CornerElements from "@/components/CornerElements";
import { Target, Trophy, Clock, CheckCircle, Gift, Award } from "lucide-react";
import { playButtonHover } from "@/lib/audio";

interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: "daily" | "weekly";
}

const QUESTS_DATABASE: Quest[] = [
  { id: "quest_water_1500", title: "Liquid Matrix", description: "Absorb at least 1,500 ml of water today.", xpReward: 150, type: "daily" },
  { id: "quest_calories_1500", title: "Fuel Syncing", description: "Secure at least 1,500 calories logged today.", xpReward: 150, type: "daily" },
  { id: "quest_workout_1", title: "Active Cyborg", description: "Complete at least 1 active workout session today.", xpReward: 200, type: "daily" },
  { id: "quest_workouts_3_week", title: "Persistent Engine", description: "Complete 3 workout sessions this week.", xpReward: 500, type: "weekly" },
  { id: "quest_water_10k_week", title: "Hydration Surge", description: "Consume 10,000 ml of water in total over the last 7 days.", xpReward: 500, type: "weekly" }
];

const ChallengesPage = () => {
  const { stats, dailyHistory, completedQuests, claimQuestReward } = useAppServices();
  const [timeLeft, setTimeLeft] = useState("");

  const handleHover = () => {
    playButtonHover();
  };

  // 1. Ticking Countdown Timer to Midnight
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      
      const diffMs = midnight.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const formatted = `${String(diffHrs).padStart(2, "0")}H ${String(diffMins).padStart(2, "0")}M ${String(diffSecs).padStart(2, "0")}S`;
      setTimeLeft(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Compute Quest Met Progress percentages
  const questProgressMap = useMemo(() => {
    const map: Record<string, { current: number; target: number; percentage: number; isMet: boolean }> = {};

    if (!stats) return map;

    // Daily Water
    const waterCurrent = stats.dailyWater;
    map["quest_water_1500"] = {
      current: waterCurrent,
      target: 1500,
      percentage: Math.min(100, (waterCurrent / 1500) * 100),
      isMet: waterCurrent >= 1500
    };

    // Daily Calories
    const calCurrent = stats.dailyCaloriesLogged;
    map["quest_calories_1500"] = {
      current: calCurrent,
      target: 1500,
      percentage: Math.min(100, (calCurrent / 1500) * 100),
      isMet: calCurrent >= 1500
    };

    // Today's Workouts Completed (check dailyHistory for today's entry)
    const todayStr = new Date().toLocaleDateString();
    const todayLog = dailyHistory.find(h => h.date === todayStr);
    const workoutsToday = todayLog ? todayLog.workoutsCompleted : 0;
    map["quest_workout_1"] = {
      current: workoutsToday,
      target: 1,
      percentage: Math.min(100, (workoutsToday / 1) * 100),
      isMet: workoutsToday >= 1
    };

    // Weekly Workouts Completed (sum of last 7 entries in history)
    const last7Days = dailyHistory.slice(0, 7);
    const workoutsWeekly = last7Days.reduce((acc, curr) => acc + curr.workoutsCompleted, 0);
    map["quest_workouts_3_week"] = {
      current: workoutsWeekly,
      target: 3,
      percentage: Math.min(100, (workoutsWeekly / 3) * 100),
      isMet: workoutsWeekly >= 3
    };

    // Weekly Water Consumed
    const waterWeekly = last7Days.reduce((acc, curr) => acc + curr.water, 0);
    map["quest_water_10k_week"] = {
      current: waterWeekly,
      target: 10000,
      percentage: Math.min(100, (waterWeekly / 10000) * 100),
      isMet: waterWeekly >= 10000
    };

    return map;
  }, [stats, dailyHistory]);

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-5xl animate-page-enter font-mono text-xs">
      
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 block mb-2">
          CHALLENGES MATRIX // QUEST BOARD
        </span>
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight flex items-center justify-center gap-2">
          <Target className="text-primary w-8 h-8" />
          Active <span className="text-primary neon-text">Quests</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
        <p className="text-muted-foreground max-w-lg mx-auto mt-3 text-[10px] leading-relaxed">
          Sync stats telemetry, accomplish physical milestones, and claim daily and weekly matrix experience point overrides.
        </p>
      </div>

      {/* Timer Banner */}
      <div className="glass-card rounded-xl p-4 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_10px_rgba(24,206,242,0.15)]">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-foreground uppercase text-xs">CYBER_QUESTS_RESET_TIMER</h4>
            <p className="text-[9px] text-muted-foreground uppercase mt-0.5">All active daily bounties refresh at midnight local time</p>
          </div>
        </div>

        <div className="text-xl font-black text-primary font-mono tracking-widest border border-primary/20 bg-cyber-black rounded-lg px-4 py-2 shadow-glow">
          {timeLeft || "00H 00M 00S"}
        </div>
      </div>

      {/* Quests Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* DAILY QUESTS COL */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm uppercase">Daily Bounties</h3>
          </div>

          <div className="space-y-4">
            {QUESTS_DATABASE.filter(q => q.type === "daily").map((quest) => {
              const status = questProgressMap[quest.id] || { current: 0, target: 0, percentage: 0, isMet: false };
              const isClaimed = completedQuests.includes(quest.id);

              return (
                <div
                  key={quest.id}
                  className={`glass-card rounded-xl p-5 border relative overflow-hidden flex flex-col justify-between min-h-[170px] transition-all duration-300 ${
                    isClaimed 
                      ? "opacity-50 border-border/10" 
                      : status.isMet 
                      ? "border-primary/50 shadow-[0_0_12px_rgba(24,206,242,0.1)]" 
                      : "border-border/30"
                  }`}
                >
                  <CornerElements />

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        +{quest.xpReward} XP BOUNTY
                      </span>
                      {isClaimed && (
                        <span className="text-[9px] font-bold text-cyber-lime flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          CLAIMED
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wide mb-1 font-mono">
                      {quest.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-normal font-mono mb-4">
                      {quest.description}
                    </p>
                  </div>

                  {/* Progress Line or Claim Trigger */}
                  {!isClaimed ? (
                    <div className="space-y-3 font-mono text-[9px]">
                      <div className="flex justify-between">
                        <span>METRICS: {status.current.toLocaleString()} / {status.target.toLocaleString()}</span>
                        <span>{Math.round(status.percentage)}%</span>
                      </div>
                      <div className="w-full bg-cyber-black rounded-full h-1 overflow-hidden border border-border/10">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${status.percentage}%`,
                            backgroundColor: status.isMet ? "var(--cyber-blue-bright)" : "var(--cyber-violet)",
                            boxShadow: status.isMet ? "0 0 5px var(--cyber-blue-bright)" : "none"
                          }}
                        />
                      </div>

                      {status.isMet && (
                        <button
                          onClick={() => claimQuestReward(quest.id, quest.xpReward)}
                          onMouseEnter={handleHover}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-[9px] font-bold uppercase tracking-widest py-2 rounded-lg mt-2 cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(24,206,242,0.2)] animate-glow"
                        >
                          <Gift size={12} />
                          CLAIM BOUNTY OVERRIDE
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground/40 text-[9px] font-bold text-center border border-dashed border-border/15 py-1.5 rounded uppercase">
                      Quest Database Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* WEEKLY CHALLENGES COL */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-2">
            <Trophy className="w-4 h-4 text-cyber-violet" />
            <h3 className="font-bold text-foreground text-sm uppercase">Weekly Protocols</h3>
          </div>

          <div className="space-y-4">
            {QUESTS_DATABASE.filter(q => q.type === "weekly").map((quest) => {
              const status = questProgressMap[quest.id] || { current: 0, target: 0, percentage: 0, isMet: false };
              const isClaimed = completedQuests.includes(quest.id);
              const color = "var(--cyber-violet)";

              return (
                <div
                  key={quest.id}
                  className={`glass-card rounded-xl p-5 border relative overflow-hidden flex flex-col justify-between min-h-[170px] transition-all duration-300 ${
                    isClaimed 
                      ? "opacity-50 border-border/10" 
                      : status.isMet 
                      ? "border-cyber-violet/50 shadow-[0_0_12px_rgba(139,92,246,0.1)]" 
                      : "border-border/30"
                  }`}
                >
                  <CornerElements />

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold text-cyber-violet bg-cyber-violet/10 border border-cyber-violet/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        +{quest.xpReward} XP BOUNTY
                      </span>
                      {isClaimed && (
                        <span className="text-[9px] font-bold text-cyber-lime flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          CLAIMED
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wide mb-1 font-mono">
                      {quest.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-normal font-mono mb-4">
                      {quest.description}
                    </p>
                  </div>

                  {/* Progress Line or Claim Trigger */}
                  {!isClaimed ? (
                    <div className="space-y-3 font-mono text-[9px]">
                      <div className="flex justify-between">
                        <span>METRICS: {status.current.toLocaleString()} / {status.target.toLocaleString()}</span>
                        <span>{Math.round(status.percentage)}%</span>
                      </div>
                      <div className="w-full bg-cyber-black rounded-full h-1 overflow-hidden border border-border/10">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${status.percentage}%`,
                            backgroundColor: color,
                            boxShadow: status.isMet ? `0 0 5px ${color}` : "none"
                          }}
                        />
                      </div>

                      {status.isMet && (
                        <button
                          onClick={() => claimQuestReward(quest.id, quest.xpReward)}
                          onMouseEnter={handleHover}
                          className="w-full bg-cyber-violet text-white hover:bg-cyber-violet/90 text-[9px] font-bold uppercase tracking-widest py-2 rounded-lg mt-2 cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(139,92,246,0.2)] animate-glow"
                          style={{ boxShadow: `0 0 10px rgba(139,92,246,0.2)` }}
                        >
                          <Gift size={12} />
                          CLAIM WEEKLY MULTIPLIER
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground/40 text-[9px] font-bold text-center border border-dashed border-border/15 py-1.5 rounded uppercase">
                      Quest Database Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ChallengesPage;

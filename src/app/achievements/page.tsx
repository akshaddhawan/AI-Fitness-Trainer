"use client";

import React, { useMemo } from "react";
import { useAppServices, ACHIEVEMENTS_DATABASE, UserStats, Achievement } from "@/providers/AppServicesProvider";
import { Trophy, Zap, Award, Lock } from "lucide-react";

interface BadgeCardProps {
  badge: Achievement;
  unlockDate: string | undefined;
  stats: UserStats | null;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, unlockDate, stats }) => {
  const isUnlocked = !!unlockDate;

  // Calculate progress toward lock criteria
  const progress = useMemo(() => {
    if (isUnlocked) return 100;
    if (!stats) return 0;

    switch (badge.id) {
      case "first_workout":
        return Math.min(100, (stats.workoutsCompleted / 1) * 100);
      case "workouts_5":
        return Math.min(100, (stats.workoutsCompleted / 5) * 100);
      case "streak_3":
        return Math.min(100, (stats.streak / 3) * 100);
      case "streak_7":
        return Math.min(100, (stats.streak / 7) * 100);
      case "water_1k":
        return Math.min(100, (stats.dailyWater / 1000) * 100);
      case "water_3k":
        return Math.min(100, (stats.dailyWater / 3000) * 100);
      case "calories_logged":
        return Math.min(100, stats.dailyCaloriesLogged > 0 ? 100 : 0);
      case "calories_target":
        return Math.min(100, (stats.dailyCaloriesLogged / 2000) * 100);
      case "level_2":
        return Math.min(100, (stats.level / 2) * 100);
      case "level_5":
        return Math.min(100, (stats.level / 5) * 100);
      case "level_10":
        return Math.min(100, (stats.level / 10) * 100);
      case "xp_1k":
        return Math.min(100, (stats.xp / 1000) * 100);
      case "program_created":
        return 0; // Handled dynamically
      case "gym_lord":
        const lvlProg = (stats.level / 10) * 50;
        const wrkProg = (stats.workoutsCompleted / 10) * 50;
        return Math.min(100, lvlProg + wrkProg);
      default:
        return 0;
    }
  }, [badge.id, isUnlocked, stats]);

  const rarityColors = {
    Common: "var(--cyber-blue-bright)",
    Rare: "var(--cyber-violet)",
    Epic: "var(--cyber-orange)",
    Legendary: "var(--cyber-magenta)",
  };

  const color = rarityColors[badge.rarity] || "var(--cyber-blue-bright)";

  return (
    <div
      className={`glass-card rounded-xl p-5 border flex flex-col items-center justify-between text-center relative transition-all duration-300 group overflow-hidden ${
        isUnlocked 
          ? "opacity-100 shadow-[0_0_15px_rgba(24,206,242,0.1)] hover:shadow-[0_0_25px_rgba(24,206,242,0.2)]"
          : "opacity-60 hover:opacity-80"
      }`}
      style={{ borderColor: isUnlocked ? `${color}40` : "rgba(255,255,255,0.05)" }}
    >
      {/* Background ambient light for unlocked */}
      {isUnlocked && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
        />
      )}

      {/* Rarity Tag */}
      <span 
        className="text-[8px] font-mono font-bold tracking-widest uppercase mb-3 px-2 py-0.5 rounded border border-border/10"
        style={{ color: color, backgroundColor: `${color}08` }}
      >
        {badge.rarity}
      </span>

      {/* Icon Area */}
      <div 
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl relative mb-3 transition-transform duration-500 ${
          isUnlocked 
            ? "bg-cyber-black border-2 animate-float"
            : "bg-cyber-black/40 border grayscale border-border/20"
        }`}
        style={{ 
          borderColor: isUnlocked ? color : "rgba(255, 255, 255, 0.1)",
          boxShadow: isUnlocked ? `0 0 15px ${color}20` : "none" 
        }}
      >
        {isUnlocked ? (
          <span>{badge.icon}</span>
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground/40" />
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 w-full">
        <h4 className={`text-xs font-bold font-mono tracking-wide ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
          {badge.title}
        </h4>
        <p className="text-[10px] text-muted-foreground leading-normal h-8 flex items-center justify-center px-1 font-mono">
          {badge.description}
        </p>
      </div>

      {/* Progress or Unlock Date */}
      <div className="w-full mt-4 pt-3 border-t border-border/10 font-mono text-[8px] text-muted-foreground flex flex-col gap-1.5">
        {isUnlocked ? (
          <div className="flex justify-between items-center text-primary font-bold">
            <span>STATUS: SECURED</span>
            <span>{unlockDate}</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>PROGRESS</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-cyber-black rounded-full h-1 overflow-hidden border border-border/10">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 5px ${color}`
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AchievementsPage = () => {
  const { stats, achievements } = useAppServices();

  const unlockedCount = useMemo(() => {
    if (!achievements) return 0;
    return Object.keys(achievements).length;
  }, [achievements]);

  const totalCount = ACHIEVEMENTS_DATABASE.length;

  const unlockedPercentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return (unlockedCount / totalCount) * 100;
  }, [unlockedCount, totalCount]);

  // Find rarest unlocked achievement
  const rarestUnlocked = useMemo(() => {
    if (!achievements) return null;
    const unlockedIds = Object.keys(achievements);
    if (unlockedIds.length === 0) return null;

    // Rarity weights
    const weights = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 };
    
    let rarest: Achievement | null = null;
    let maxWeight = 0;

    unlockedIds.forEach((id) => {
      const match = ACHIEVEMENTS_DATABASE.find(b => b.id === id);
      if (match) {
        const w = weights[match.rarity] || 0;
        if (w > maxWeight) {
          maxWeight = w;
          rarest = match;
        }
      }
    });

    return rarest;
  }, [achievements]);

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-6xl animate-page-enter font-mono">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/70 block mb-3">
          GAMIFICATION STATS
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
          <span className="text-foreground">Trophy </span>
          <span className="text-primary neon-text">Room</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
        <p className="text-muted-foreground max-w-lg mx-auto text-xs">
          Track your fitness accomplishments, earn badges, and watch your progression metrics skyrocket.
        </p>
      </div>

      {/* Showcase Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        {/* Total Badges */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 relative flex items-center gap-5">
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />
          
          <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(24,206,242,0.15)] shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest block">BADGES EARNED</span>
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {unlockedCount} <span className="text-muted-foreground text-sm font-medium">/ {totalCount}</span>
            </span>
            <span className="text-[9px] text-primary block uppercase tracking-wider font-bold">
              {Math.round(unlockedPercentage)}% Completed
            </span>
          </div>
        </div>

        {/* Current XP / Level */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 relative flex items-center gap-5">
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />
          
          <div className="w-14 h-14 rounded-lg bg-cyber-violet/10 border border-cyber-violet/30 flex items-center justify-center text-cyber-violet shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0">
            <Zap className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest block">CURRENT RANK</span>
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              LVL {stats?.level || 1}
            </span>
            <span className="text-[9px] text-cyber-violet block uppercase tracking-wider font-bold">
              XP: {stats?.xp || 0} Points
            </span>
          </div>
        </div>

        {/* Rarest Badge */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 relative flex items-center gap-5">
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />
          
          <div className="w-14 h-14 rounded-lg bg-cyber-magenta/10 border border-cyber-magenta/30 flex items-center justify-center text-cyber-magenta shadow-[0_0_15px_rgba(236,72,153,0.15)] shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest block">RAREST BADGE</span>
            <span className="text-sm font-extrabold text-foreground tracking-tight block truncate">
              {rarestUnlocked ? (rarestUnlocked as Achievement).title.toUpperCase() : "NONE YET"}
            </span>
            <span className="text-[9px] text-cyber-magenta block uppercase tracking-wider font-bold">
              {rarestUnlocked ? `${(rarestUnlocked as Achievement).rarity} Status` : "Unlock badges to rank"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS_DATABASE.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            unlockDate={achievements?.[badge.id]}
            stats={stats}
          />
        ))}
      </div>
    </section>
  );
};

export default AchievementsPage;

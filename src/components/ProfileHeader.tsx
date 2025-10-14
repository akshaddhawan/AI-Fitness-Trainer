"use client";

import React from "react";
import CornerElements from "./CornerElements";
import { useAppServices } from "@/providers/AppServicesProvider";
import { Flame, Crown, Shield, Zap, Sparkles } from "lucide-react";

const ProfileHeader = ({ user }: { user: any }) => {
  const { stats, achievements } = useAppServices();
  if (!user) return null;

  const level = stats?.level || 1;
  const xp = stats?.xp || 0;
  const streak = stats?.streak || 0;

  // Calculate relative progress in level (each level requires 500 XP)
  const currentLevelBaseXp = (level - 1) * 500;
  const xpInCurrentLevel = xp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 500) * 100));

  // Determine Rank configurations
  const rankConfigs = {
    "Cyber Gym Lord": { minLvl: 10, color: "var(--cyber-magenta)", text: "text-cyber-magenta", icon: <Crown className="w-3.5 h-3.5" />, shadow: "0 0 15px rgba(236,72,153,0.3)" },
    "Iron Master": { minLvl: 7, color: "var(--cyber-orange)", text: "text-cyber-orange", icon: <Shield className="w-3.5 h-3.5" />, shadow: "0 0 15px rgba(249,115,22,0.3)" },
    "Elite Athlete": { minLvl: 4, color: "var(--cyber-gold)", text: "text-cyber-gold", icon: <Zap className="w-3.5 h-3.5" />, shadow: "0 0 15px rgba(234,179,8,0.3)" },
    "Apprentice": { minLvl: 2, color: "var(--cyber-lime)", text: "text-cyber-lime", icon: <Sparkles className="w-3.5 h-3.5" />, shadow: "0 0 15px rgba(132,204,22,0.3)" },
    "Cadet": { minLvl: 1, color: "var(--cyber-blue-bright)", text: "text-primary", icon: <Sparkles className="w-3.5 h-3.5" />, shadow: "0 0 15px rgba(24,206,242,0.3)" },
  };

  const currentRankConfig = Object.entries(rankConfigs).find(([, cfg]) => level >= cfg.minLvl)?.[1] || rankConfigs["Cadet"];
  const rankName = Object.entries(rankConfigs).find(([, cfg]) => level >= cfg.minLvl)?.[0] || "Cadet";

  return (
    <div className="mb-10 relative glass-card p-6 rounded-xl overflow-hidden animate-page-enter">
      {/* Corner borders */}
      <CornerElements />

      {/* Decorative ambient background blur */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-1000"
        style={{ backgroundColor: currentRankConfig.color }}
      />

      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 relative z-10">
        
        {/* Avatar Area with Rotating Gradient Border */}
        <div className="relative flex-shrink-0 group">
          <div 
            className="absolute -inset-1.5 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-slow-spin"
            style={{
              background: `linear-gradient(to right, ${currentRankConfig.color}, var(--cyber-violet), var(--cyber-magenta))`
            }}
          />
          
          <div className="relative w-24 h-24 rounded-full overflow-hidden border bg-cyber-black flex items-center justify-center border-border/60">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="text-3xl font-extrabold text-primary font-mono">
                {user.fullName?.charAt(0) || "U"}
              </span>
            )}
          </div>
          
          {/* Active online dot */}
          <div className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-cyber-lime border-2 border-background animate-pulse" />
        </div>

        {/* Text Details */}
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight font-mono text-foreground uppercase flex items-center justify-center md:justify-start gap-2">
                {user.fullName}
              </h2>
              <p className="text-[10px] text-muted-foreground/60 font-mono lowercase">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            {/* Badges/Streaks row */}
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono">
              {streak > 0 && (
                <div className="flex items-center bg-cyber-orange/10 border border-cyber-orange/30 rounded-lg px-3 py-1 text-cyber-orange font-bold text-[10px] shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                  <Flame className="w-3.5 h-3.5 mr-1.5 fill-cyber-orange animate-pulse" />
                  <span>{streak} DAY STREAK</span>
                </div>
              )}

              {/* Holographic rank chip */}
              <div 
                className="flex items-center gap-1.5 bg-cyber-black/80 border rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider animate-shimmer"
                style={{ 
                  color: currentRankConfig.color, 
                  borderColor: `${currentRankConfig.color}40`,
                  boxShadow: currentRankConfig.shadow 
                }}
              >
                {currentRankConfig.icon}
                <span>{rankName}</span>
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-primary via-cyber-violet to-transparent opacity-25 my-3" />

          {/* Progression stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="flex gap-4 text-[9px] uppercase tracking-wider text-muted-foreground justify-center md:justify-start">
              <div>
                Workouts: <span className="text-foreground font-bold">{stats?.workoutsCompleted || 0}</span>
              </div>
              <div className="w-px h-3 bg-border/30" />
              <div>
                Trophies: <span className="text-foreground font-bold">{achievements ? Object.keys(achievements).length : 0}</span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="w-full max-w-xs md:max-w-sm ml-auto mr-auto md:mr-0 text-left">
              <div className="flex justify-between text-[9px] text-muted-foreground uppercase mb-1 tracking-wider">
                <span>XP PROGRESS: {xpInCurrentLevel}/500 XP</span>
                <span className="text-foreground font-bold" style={{ color: currentRankConfig.color }}>
                  LVL {level}
                </span>
              </div>
              <div className="h-2 w-full bg-cyber-black rounded-lg border border-border/40 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r transition-all duration-700 ease-out shadow-[0_0_10px_rgba(24,206,242,0.3)]"
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundImage: `linear-gradient(to right, ${currentRankConfig.color}, var(--cyber-violet))`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileHeader;

"use client";

import React, { useState } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import CornerElements from "./CornerElements";
import { Button } from "./ui/button";
import { playTickSound } from "@/lib/audio";
import { GlassWater, Flame, Plus, CheckCircle2 } from "lucide-react";

interface IntakeTrackerProps {
  targetCalories?: number;
}

const IntakeTracker = ({ targetCalories = 2000 }: IntakeTrackerProps) => {
  const { stats, logWater, logCalories } = useAppServices();
  const [customCalorieInput, setCustomCalorieInput] = useState("");

  const waterConsumed = stats?.dailyWater || 0;
  const waterTarget = 3000; // 3 Liters target
  const waterPercent = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));

  const caloriesConsumed = stats?.dailyCaloriesLogged || 0;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / targetCalories) * 100));

  const handleWaterClick = (amount: number) => {
    playTickSound();
    logWater(amount);
  };

  const handleCalorieClick = (amount: number) => {
    playTickSound();
    logCalories(amount);
  };

  const handleCustomCalorieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kcal = parseInt(customCalorieInput);
    if (isNaN(kcal) || kcal <= 0) return;
    
    playTickSound();
    logCalories(kcal);
    setCustomCalorieInput("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-mono">
      {/* 1. WATER TRACKER */}
      <div className="relative border border-border p-6 rounded-lg bg-card/20 backdrop-blur-sm group">
        <CornerElements />
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/40" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded border border-primary/20 text-primary">
              <GlassWater size={18} />
            </div>
            <h3 className="text-md font-bold tracking-tight text-foreground uppercase">H2O DATABASE</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block">Consumed</span>
            <span className="text-sm font-bold text-primary">{waterConsumed} / {waterTarget} ml</span>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          {/* Glass Cylinder Graphic */}
          <div className="relative w-16 h-36 border border-border/80 rounded-b-xl overflow-hidden bg-cyber-terminal-bg shadow-[0_0_10px_rgba(24,206,242,0.05)] flex items-end">
            {/* Wave animation filling up */}
            <div 
              className="w-full bg-gradient-to-t from-primary/40 to-primary/80 transition-all duration-700 relative"
              style={{ height: `${waterPercent}%` }}
            >
              {/* Animated wave crest */}
              <div className="absolute -top-1 left-0 right-0 h-2 bg-primary/30 opacity-70 animate-pulse" />
              {waterPercent >= 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <CheckCircle2 className="w-6 h-6 text-primary-foreground stroke-[3]" />
                </div>
              )}
            </div>
            {/* Measurement lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-25">
              <div className="h-px w-3 bg-foreground/50 self-end"></div>
              <div className="h-px w-5 bg-foreground/50 self-end"></div>
              <div className="h-px w-3 bg-foreground/50 self-end"></div>
              <div className="h-px w-5 bg-foreground/50 self-end"></div>
              <div className="h-px w-3 bg-foreground/50 self-end"></div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Log your water to stay hydrated. Each entry awards level XP to boost rank.
            </p>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleWaterClick(250)}
                className="flex-1 bg-cyber-terminal-bg border border-border/50 hover:border-primary/50 text-foreground hover:bg-primary/10 text-xs py-2 h-auto"
              >
                +250 ml
              </Button>
              <Button 
                onClick={() => handleWaterClick(500)}
                className="flex-1 bg-cyber-terminal-bg border border-border/50 hover:border-primary/50 text-foreground hover:bg-primary/10 text-xs py-2 h-auto"
              >
                +500 ml
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CALORIE LOG TRACKER */}
      <div className="relative border border-border p-6 rounded-lg bg-card/20 backdrop-blur-sm group">
        <CornerElements />
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/40" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-secondary/10 rounded border border-secondary/20 text-secondary">
              <Flame size={18} />
            </div>
            <h3 className="text-md font-bold tracking-tight text-foreground uppercase">CALORIC REGISTRY</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block">Target Goal</span>
            <span className="text-sm font-bold text-secondary">{caloriesConsumed} / {targetCalories} kcal</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Calorie Gauge Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase mb-1.5 tracking-wider">
              <span>Calorie Intake Progress</span>
              <span className="text-secondary font-bold">{caloriePercent}%</span>
            </div>
            <div className="h-3 w-full bg-cyber-terminal-bg rounded border border-border/40 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-secondary/70 to-secondary transition-all duration-700 shadow-[0_0_8px_var(--secondary)]"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="flex gap-2 flex-grow">
              <Button 
                onClick={() => handleCalorieClick(100)}
                className="flex-grow bg-cyber-terminal-bg border border-border/50 hover:border-secondary/50 text-foreground hover:bg-secondary/10 text-xs py-2.5 h-auto"
              >
                +100 kcal
              </Button>
              <Button 
                onClick={() => handleCalorieClick(250)}
                className="flex-grow bg-cyber-terminal-bg border border-border/50 hover:border-secondary/50 text-foreground hover:bg-secondary/10 text-xs py-2.5 h-auto"
              >
                +250 kcal
              </Button>
            </div>

            <form onSubmit={handleCustomCalorieSubmit} className="flex gap-2">
              <input
                type="number"
                placeholder="Custom..."
                value={customCalorieInput}
                onChange={(e) => setCustomCalorieInput(e.target.value)}
                className="w-20 bg-cyber-terminal-bg border border-border/60 rounded px-2 text-xs focus:outline-none focus:border-secondary/50 text-foreground"
              />
              <Button
                type="submit"
                disabled={!customCalorieInput.trim()}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 text-xs"
              >
                <Plus size={14} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeTracker;

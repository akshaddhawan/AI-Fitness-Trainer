"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import CornerElements from "@/components/CornerElements";
import { playSuccessSound, playButtonHover } from "@/lib/audio";
import { Flame, Sparkles, Plus, RotateCcw, Activity } from "lucide-react";

interface Preset {
  name: string;
  description: string;
  carbs: number;
  protein: number;
  fat: number;
}

interface Booster {
  id: string;
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  cost: string;
}

const PRESETS: Preset[] = [
  { name: "Anabolic Muscle Matrix", description: "Maximizes protein synthesis for muscular repair.", carbs: 120, protein: 200, fat: 40 },
  { name: "Thermal Shred Formula", description: "Low carb, high protein setup for fat oxidation.", carbs: 40, protein: 180, fat: 20 },
  { name: "Keto-Drive Charge", description: "High healthy lipids to sustain ketogenic performance.", carbs: 10, protein: 110, fat: 85 },
  { name: "Nanotech Carbo-Load", description: "Glycogen super-compensation for endurance stages.", carbs: 260, protein: 70, fat: 15 },
];

const BOOSTERS: Booster[] = [
  { id: "creatine", name: "Nano-Creatine Boost", carbs: 0, protein: 10, fat: 0, cost: "+10g Amino Matrix" },
  { id: "soy", name: "Soy-Protein Isolate", carbs: 2, protein: 30, fat: 1, cost: "+30g Soy Extract" },
  { id: "mct", name: "MCT Cyber-Lipids", carbs: 0, protein: 0, fat: 15, cost: "+15g Lipid Energy" },
];

const NutritionSynthesizer = () => {
  const { logCalories } = useAppServices();
  const [carbs, setCarbs] = useState(120);
  const [protein, setProtein] = useState(140);
  const [fat, setFat] = useState(45);
  const [activeBoosters, setActiveBoosters] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthLog, setSynthLog] = useState<string[]>(["[SYS] SYNTHESIS CONSOLE STANDBY..."]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; size: number; speedY: number; color: string; alpha: number }>>([]);

  const handleHover = () => {
    playButtonHover();
  };

  // Add booster values to base macro amounts for final calculation
  const calculatedStats = useMemo(() => {
    let finalCarbs = carbs;
    let finalProtein = protein;
    let finalFat = fat;

    activeBoosters.forEach((boosterId) => {
      const b = BOOSTERS.find((x) => x.id === boosterId);
      if (b) {
        finalCarbs += b.carbs;
        finalProtein += b.protein;
        finalFat += b.fat;
      }
    });

    const cCals = finalCarbs * 4;
    const pCals = finalProtein * 4;
    const fCals = finalFat * 9;
    const totalCals = cCals + pCals + fCals;

    return {
      carbs: finalCarbs,
      protein: finalProtein,
      fat: finalFat,
      totalCalories: totalCals,
      carbPct: totalCals > 0 ? (cCals / totalCals) * 100 : 0,
      proteinPct: totalCals > 0 ? (pCals / totalCals) * 100 : 0,
      fatPct: totalCals > 0 ? (fCals / totalCals) * 100 : 0,
    };
  }, [carbs, protein, fat, activeBoosters]);

  // Load preset specs
  const handleApplyPreset = (preset: Preset) => {
    setCarbs(preset.carbs);
    setProtein(preset.protein);
    setFat(preset.fat);
    setActiveBoosters([]);
    setSynthLog((prev) => [
      `[SYS] APPLIED BLUEPRINT: ${preset.name.toUpperCase()}`,
      `[SYS] BASE SPECS SYNCED.`,
      ...prev.slice(0, 5),
    ]);
  };

  // Toggle Booster
  const handleToggleBooster = (id: string) => {
    setActiveBoosters((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((x) => x !== id) : [...prev, id];
      setSynthLog((log) => [
        `[SYS] ${exists ? "DE-INTEGRATED" : "INTEGRATED"} MODULE: ${id.toUpperCase()}`,
        ...log.slice(0, 5),
      ]);
      return updated;
    });
  };

  // Reset Sliders
  const handleReset = () => {
    setCarbs(120);
    setProtein(140);
    setFat(45);
    setActiveBoosters([]);
    setSynthLog(["[SYS] SPECS RESET TO FACTORY PARAMETERS."]);
  };

  // Execute synthesis
  const handleSynthesize = () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    playSuccessSound();

    setSynthLog((prev) => [
      `[PROC] IGNITING PARTICLE INJECTORS...`,
      `[PROC] COMPRESSING AMINO CORE SYNTHESIS...`,
      `[PROC] CALORIC DENSITY SYNCING: ${calculatedStats.totalCalories} KCAL`,
      ...prev.slice(0, 5),
    ]);

    // Spawn synthesis particles
    if (canvasRef.current) {
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      for (let i = 0; i < 60; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: height - 10,
          size: Math.random() * 5 + 2,
          speedY: -(Math.random() * 4 + 2),
          color: i % 3 === 0 ? "rgba(24, 206, 242, 0.8)" : i % 3 === 1 ? "rgba(236, 72, 153, 0.8)" : "rgba(234, 179, 8, 0.8)",
          alpha: 1,
        });
      }
    }

    setTimeout(() => {
      logCalories(calculatedStats.totalCalories);
      setSynthLog((prev) => [
        `[SYS] SUCCESS: FUEL CYLINDER SYNTHESIZED!`,
        `[SYS] CALORIES DISPATCHED TO PROFILE TELEMETRY.`,
        ...prev.slice(0, 5),
      ]);
      setIsSynthesizing(false);
    }, 2000);
  };

  // Fluid Waving Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Draw Glass Cylinder Container outline
      ctx.strokeStyle = "rgba(24, 206, 242, 0.2)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(10, 10, w - 20, h - 20, 20);
      ctx.stroke();

      // Mask layout inside the glass cylinder
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(12, 12, w - 24, h - 24, 18);
      ctx.clip();

      // Ratios translate directly to heights inside the container
      const totalVolume = calculatedStats.carbs + calculatedStats.protein + calculatedStats.fat;
      const fillFactor = Math.min(0.85, totalVolume / 650); // Cap max fill visually

      const cylinderFillHeight = h * fillFactor;
      const carbHeight = cylinderFillHeight * (calculatedStats.carbPct / 100);
      const proteinHeight = cylinderFillHeight * (calculatedStats.proteinPct / 100);
      const fatHeight = cylinderFillHeight * (calculatedStats.fatPct / 100);

      phase += 0.04;

      let currentBaseY = h - 12;

      // 1. Draw Fat Fluid (Yellow / Gold)
      if (fatHeight > 0) {
        ctx.fillStyle = "rgba(234, 179, 8, 0.65)";
        ctx.beginPath();
        ctx.moveTo(12, currentBaseY);
        for (let x = 12; x <= w - 12; x++) {
          const y = currentBaseY - fatHeight + Math.sin(x * 0.03 + phase) * 6;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w - 12, currentBaseY);
        ctx.closePath();
        ctx.fill();
        currentBaseY -= fatHeight;
      }

      // 2. Draw Carb Fluid (Cyan / Cyber Blue)
      if (carbHeight > 0) {
        ctx.fillStyle = "rgba(24, 206, 242, 0.65)";
        ctx.beginPath();
        ctx.moveTo(12, currentBaseY);
        for (let x = 12; x <= w - 12; x++) {
          const y = currentBaseY - carbHeight + Math.sin(x * 0.025 - phase) * 8;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w - 12, currentBaseY);
        ctx.closePath();
        ctx.fill();
        currentBaseY -= carbHeight;
      }

      // 3. Draw Protein Fluid (Pink / Magenta)
      if (proteinHeight > 0) {
        ctx.fillStyle = "rgba(236, 72, 153, 0.65)";
        ctx.beginPath();
        ctx.moveTo(12, currentBaseY);
        for (let x = 12; x <= w - 12; x++) {
          const y = currentBaseY - proteinHeight + Math.sin(x * 0.035 + phase * 1.5) * 5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w - 12, currentBaseY);
        ctx.closePath();
        ctx.fill();
      }

      // Render Floating bubbles/sparks
      particlesRef.current.forEach((p, idx) => {
        p.y += p.speedY;
        p.alpha -= 0.012;
        ctx.fillStyle = p.color.replace("0.8", String(p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove dead particles
        if (p.alpha <= 0 || p.y < 12) {
          particlesRef.current.splice(idx, 1);
        }
      });

      // Ambient bubbles rises occasionally
      if (Math.random() < 0.12 && particlesRef.current.length < 40) {
        particlesRef.current.push({
          x: 20 + Math.random() * (w - 40),
          y: h - 15,
          size: Math.random() * 3 + 1,
          speedY: -(Math.random() * 1.5 + 0.8),
          color: Math.random() > 0.5 ? "rgba(24, 206, 242, 0.4)" : "rgba(236, 72, 153, 0.4)",
          alpha: 0.8,
        });
      }

      ctx.restore();

      // Re-trigger animation frame
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calculatedStats]);

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-6xl animate-page-enter font-mono text-xs">
      
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 block mb-2">
          NUTRITION SYSTEM // COMBAT FUEL SYNTHESIZER
        </span>
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight flex items-center justify-center gap-2">
          <Activity className="text-primary w-8 h-8" />
          Fuel <span className="text-primary neon-text">Synthesizer</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
        <p className="text-muted-foreground max-w-lg mx-auto mt-3 text-[10px] leading-relaxed">
          Formulate micro and macro compositions, inject energy catalysts, and synthesize liquid fuel canisters to power up your athletic chassis stats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Panel: Sliders & Custom Blueprints (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Sliders Console */}
          <div className="glass-card rounded-xl p-5 relative flex-1">
            <CornerElements />
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase">
                Step 1: Custom Macro Parameters
              </h3>
              <button
                onClick={handleReset}
                onMouseEnter={handleHover}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-[9px] uppercase cursor-pointer"
              >
                <RotateCcw size={12} />
                RESET SPECS
              </button>
            </div>

            {/* Slider Rows */}
            <div className="space-y-6 font-mono">
              
              {/* Carbs */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-primary tracking-wider uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    CARBOHYDRATES
                  </span>
                  <span className="text-foreground">{carbs}g ({Math.round(calculatedStats.carbPct)}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  value={carbs}
                  onChange={(e) => setCarbs(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-cyber-black rounded-lg appearance-none cursor-pointer border border-primary/20 accent-primary"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground/50">
                  <span>0G (MIN)</span>
                  <span>350G (MAX)</span>
                </div>
              </div>

              {/* Protein */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-cyber-magenta tracking-wider uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyber-magenta" />
                    PROTEIN
                  </span>
                  <span className="text-foreground">{protein}g ({Math.round(calculatedStats.proteinPct)}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={protein}
                  onChange={(e) => setProtein(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-cyber-black rounded-lg appearance-none cursor-pointer border border-cyber-magenta/20 accent-cyber-magenta"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground/50">
                  <span>0G (MIN)</span>
                  <span>300G (MAX)</span>
                </div>
              </div>

              {/* Lipids / Fat */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-cyber-gold tracking-wider uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyber-gold" />
                    LIPIDS / FATS
                  </span>
                  <span className="text-foreground">{fat}g ({Math.round(calculatedStats.fatPct)}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={fat}
                  onChange={(e) => setFat(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-cyber-black rounded-lg appearance-none cursor-pointer border border-cyber-gold/20 accent-cyber-gold"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground/50">
                  <span>0G (MIN)</span>
                  <span>150G (MAX)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Blueprint Presets */}
          <div className="glass-card rounded-xl p-5 relative">
            <CornerElements />
            <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">
              Step 2: Sync Core Preset Blueprints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3.5 rounded-lg border border-border/40 bg-cyber-black/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[90px]"
                >
                  <div>
                    <h4 className="font-bold text-foreground text-[10px] uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {preset.name}
                    </h4>
                    <p className="text-[8px] text-muted-foreground/80 mt-1 leading-normal font-mono">
                      {preset.description}
                    </p>
                  </div>
                  <div className="flex gap-2.5 mt-2 font-mono text-[8px] text-primary/70 uppercase">
                    <span>C: {preset.carbs}G</span>
                    <span>&bull;</span>
                    <span>P: {preset.protein}G</span>
                    <span>&bull;</span>
                    <span>F: {preset.fat}G</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Panel: Visualization Tank & Injectors (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Canvas Synthesis Visualization */}
          <div className="glass-card rounded-xl p-5 relative flex flex-col items-center justify-between min-h-[380px]">
            <CornerElements />
            <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase w-full mb-3">
              synthesis_fluid_chamber
            </h3>

            <div className="relative w-full max-w-[200px] aspect-[2/3] my-2 bg-cyber-black/60 rounded-3xl overflow-hidden border border-border/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              <canvas
                ref={canvasRef}
                width={200}
                height={300}
                className="w-full h-full block"
              />
              {isSynthesizing && (
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px] pointer-events-none flex items-center justify-center animate-pulse">
                  <span className="text-[9px] font-black text-primary tracking-[0.25em] animate-ping">SYNTHESIZING...</span>
                </div>
              )}
            </div>

            {/* Micro Specs */}
            <div className="w-full grid grid-cols-3 gap-2 text-center text-[9px] font-mono border-t border-border/30 pt-3">
              <div>
                <p className="text-muted-foreground">TOTAL CARBS</p>
                <p className="font-bold text-primary text-xs mt-0.5">{calculatedStats.carbs}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">TOTAL AMINO</p>
                <p className="font-bold text-cyber-magenta text-xs mt-0.5">{calculatedStats.protein}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">TOTAL LIPIDS</p>
                <p className="font-bold text-cyber-gold text-xs mt-0.5">{calculatedStats.fat}g</p>
              </div>
            </div>
          </div>

          {/* Module Injectors & Synthesize Console */}
          <div className="glass-card rounded-xl p-5 relative flex flex-col justify-between">
            <CornerElements />
            
            {/* Injectors */}
            <div className="mb-4">
              <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3">
                Step 3: Catalyst Module Injectors
              </h3>
              <div className="space-y-2">
                {BOOSTERS.map((b) => {
                  const active = activeBoosters.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleToggleBooster(b.id)}
                      onMouseEnter={handleHover}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border text-[9px] font-mono transition-all duration-300 cursor-pointer ${
                        active 
                          ? "bg-primary/10 border-primary text-primary shadow-[0_0_8px_rgba(24,206,242,0.1)]"
                          : "bg-cyber-black/40 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 uppercase font-bold">
                        <Plus size={10} className={active ? "rotate-45 transition-transform" : "transition-transform"} />
                        {b.name}
                      </span>
                      <span className="text-[8px] opacity-75">{b.cost}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Synthesizer Terminal Logs */}
            <div className="bg-cyber-black/80 rounded border border-border/50 p-2.5 mb-4 h-[75px] overflow-y-auto font-mono text-[8px] text-primary/70 leading-normal custom-scroll uppercase select-none">
              {synthLog.map((log, idx) => (
                <div key={idx} className="truncate">{log}</div>
              ))}
            </div>

            {/* Synth Activation Trigger */}
            <button
              onClick={handleSynthesize}
              onMouseEnter={handleHover}
              disabled={isSynthesizing || calculatedStats.totalCalories === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-1.5 rounded-lg shadow-[0_0_12px_rgba(24,206,242,0.2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <Flame size={14} className={isSynthesizing ? "animate-pulse" : ""} />
              SYNTHESIZE FUEL CYLINDER ({calculatedStats.totalCalories} kcal)
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};

export default NutritionSynthesizer;

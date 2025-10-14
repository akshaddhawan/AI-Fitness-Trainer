"use client";

import React, { useState, useMemo } from "react";
import StatsRing from "@/components/StatsRing";
import { RefreshCw, Sparkles, Scale, Info } from "lucide-react";

type UnitSystem = "metric" | "imperial";

const BMICalculatorPage = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  
  // Metric states
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);

  // Imperial states
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(9);
  const [weightLbs, setWeightLbs] = useState(154);

  // Calculate BMI
  const bmi = useMemo(() => {
    let heightMeters = 0;
    let weightInKg = 0;

    if (unitSystem === "metric") {
      heightMeters = heightCm / 100;
      weightInKg = weightKg;
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      heightMeters = (totalInches * 2.54) / 100;
      weightInKg = weightLbs * 0.45359237;
    }

    if (heightMeters <= 0 || weightInKg <= 0) return 0;
    return parseFloat((weightInKg / (heightMeters * heightMeters)).toFixed(1));
  }, [unitSystem, heightCm, weightKg, heightFeet, heightInches, weightLbs]);

  // Determine category
  const category = useMemo(() => {
    if (bmi <= 0) return { name: "N/A", color: "var(--cyber-blue-bright)", text: "text-primary", percentage: 0 };
    if (bmi < 18.5) return { name: "Underweight", color: "var(--cyber-blue-bright)", text: "text-primary", percentage: 25, advice: "Focus on nutrient-dense calorie surplus foods and progressive overload resistance training to build healthy muscle mass safely.", range: "Under 18.5" };
    if (bmi < 25) return { name: "Normal Weight", color: "var(--cyber-lime)", text: "text-cyber-lime", percentage: 50, advice: "Excellent! Your weight is in a healthy range. Continue balanced nutrition, consistent workouts, and regular hydration.", range: "18.5 – 24.9" };
    if (bmi < 30) return { name: "Overweight", color: "var(--cyber-gold)", text: "text-cyber-gold", percentage: 75, advice: "Consider a mild caloric deficit coupled with consistent resistance training and cardio sessions to reduce body fat percentage.", range: "25.0 – 29.9" };
    return { name: "Obese", color: "var(--cyber-magenta)", text: "text-cyber-magenta", percentage: 100, advice: "Consult a healthcare provider to craft a structured fat-loss plan combining progressive nutrition adjustments and low-impact workouts.", range: "30.0 and above" };
  }, [bmi]);

  // Handle unit systems toggle
  const toggleUnitSystem = () => {
    if (unitSystem === "metric") {
      // CM to Feet & Inches
      const totalInches = Math.round(heightCm / 2.54);
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(totalInches % 12);
      // KG to LBS
      setWeightLbs(Math.round(weightKg * 2.20462));
      setUnitSystem("imperial");
    } else {
      // Feet & Inches to CM
      const totalInches = heightFeet * 12 + heightInches;
      setHeightCm(Math.round(totalInches * 2.54));
      // LBS to KG
      setWeightKg(Math.round(weightLbs / 2.20462));
      setUnitSystem("metric");
    }
  };

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-4xl animate-page-enter">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/70 block mb-3">
          BIOMETRICS ENGINE
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-foreground">BMI </span>
          <span className="text-primary neon-text">Calculator</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
        <p className="text-muted-foreground max-w-md mx-auto">
          Calculate your Body Mass Index (BMI) and review your health recommendations instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="md:col-span-7 glass-card rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />

          {/* Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-primary" />
              Adjust Metrics
            </h3>
            
            <button
              onClick={toggleUnitSystem}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyber-black border border-border/40 font-mono text-[10px] text-primary hover:border-primary transition-all duration-300"
            >
              <RefreshCw className="w-3 h-3" />
              {unitSystem === "metric" ? "METRIC SYSTEM (KG/CM)" : "IMPERIAL SYSTEM (LB/FT)"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted-foreground">HEIGHT</span>
                {unitSystem === "metric" ? (
                  <span className="text-foreground font-bold">{heightCm} cm</span>
                ) : (
                  <span className="text-foreground font-bold">
                    {heightFeet} ft {heightInches} in
                  </span>
                )}
              </div>

              {unitSystem === "metric" ? (
                <input
                  type="range"
                  min="100"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value))}
                  className="w-full accent-primary bg-cyber-black/60 rounded h-1 cursor-pointer border border-border/20"
                />
              ) : (
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-mono text-muted-foreground block">FEET</span>
                    <input
                      type="range"
                      min="3"
                      max="8"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(parseInt(e.target.value))}
                      className="w-full accent-primary bg-cyber-black/60 rounded h-1 cursor-pointer border border-border/20"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-mono text-muted-foreground block">INCHES</span>
                    <input
                      type="range"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={(e) => setHeightInches(parseInt(e.target.value))}
                      className="w-full accent-primary bg-cyber-black/60 rounded h-1 cursor-pointer border border-border/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Weight Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted-foreground">WEIGHT</span>
                {unitSystem === "metric" ? (
                  <span className="text-foreground font-bold">{weightKg} kg</span>
                ) : (
                  <span className="text-foreground font-bold">{weightLbs} lbs</span>
                )}
              </div>

              {unitSystem === "metric" ? (
                <input
                  type="range"
                  min="30"
                  max="160"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value))}
                  className="w-full accent-primary bg-cyber-black/60 rounded h-1 cursor-pointer border border-border/20"
                />
              ) : (
                <input
                  type="range"
                  min="60"
                  max="350"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(parseInt(e.target.value))}
                  className="w-full accent-primary bg-cyber-black/60 rounded h-1 cursor-pointer border border-border/20"
                />
              )}
            </div>

            {/* Speeds visualizer */}
            <div className="pt-4 border-t border-border/20">
              <div className="bg-cyber-black/50 rounded-lg p-4 font-mono text-xs flex gap-3 items-start border border-border/10">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed text-muted-foreground">
                  <p>
                    Body Mass Index (BMI) is a calculation of your weight relative to height. It acts as an easy screening method for weight categories.
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    Note: BMI does not measure body fat directly and doesn&apos;t account for muscle mass (athletes may get flagged as overweight).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Result & Recommendations */}
        <div className="md:col-span-5 space-y-6">
          {/* Result Card */}
          <div className="glass-card rounded-xl p-6 relative flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />

            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              BMI Result
            </h3>

            {/* BMI gauge */}
            <div className="mb-4">
              <StatsRing
                percentage={category.percentage}
                size={140}
                strokeWidth={10}
                color={category.color}
                glowColor={`${category.color}40`}
                value={bmi > 0 ? bmi : "--"}
                label="BMI INDEX"
              />
            </div>

            <div className="space-y-1">
              <span className={`text-base font-bold font-mono tracking-wider ${category.text}`}>
                {category.name.toUpperCase()}
              </span>
              <p className="text-[10px] font-mono text-muted-foreground">
                Normal range: 18.5 – 24.9
              </p>
            </div>
          </div>

          {/* Advice Card */}
          {bmi > 0 && (
            <div className="glass-card rounded-xl p-5 relative font-mono text-xs leading-relaxed border" style={{ borderColor: `${category.color}30` }}>
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t" style={{ borderColor: `${category.color}40` }} />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b" style={{ borderColor: `${category.color}40` }} />

              <h4 className="font-bold text-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" style={{ color: category.color }} />
                AI ADVICE & INSIGHTS
              </h4>
              <p className="text-muted-foreground mb-4">
                {category.advice}
              </p>

              {/* BMI Table */}
              <div className="border-t border-border/20 pt-3 space-y-1 text-[10px]">
                <p className="text-muted-foreground/60 uppercase tracking-wider mb-2">WEIGHT CATEGORY INDEX</p>
                {[
                  { name: "UNDERWEIGHT", range: "< 18.5", active: bmi < 18.5, color: "var(--cyber-blue-bright)" },
                  { name: "NORMAL", range: "18.5 - 24.9", active: bmi >= 18.5 && bmi < 25, color: "var(--cyber-lime)" },
                  { name: "OVERWEIGHT", range: "25.0 - 29.9", active: bmi >= 25 && bmi < 30, color: "var(--cyber-gold)" },
                  { name: "OBESE", range: ">= 30.0", active: bmi >= 30, color: "var(--cyber-magenta)" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`flex justify-between items-center py-1 px-2 rounded ${
                      item.active 
                        ? "bg-white/5 border border-white/10 font-bold" 
                        : "opacity-40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span>{item.range}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BMICalculatorPage;

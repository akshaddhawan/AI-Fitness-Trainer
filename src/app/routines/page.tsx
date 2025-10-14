"use client";

import React, { useState, useMemo } from "react";
import { EXERCISE_DATABASE, MUSCLE_GROUPS } from "@/constants/exercises";
import { useAppServices } from "@/providers/AppServicesProvider";
import CornerElements from "@/components/CornerElements";
import { Dumbbell, Plus, Trash2, Save, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playButtonHover } from "@/lib/audio";

interface RoutineItem {
  name: string;
  sets: number;
  reps: string;
  description?: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const RoutineBuilderPage = () => {
  const { saveCustomRoutine } = useAppServices();
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("All");
  
  // Custom Routine State
  const [routineDay, setRoutineDay] = useState("Monday");
  const [routineName, setRoutineName] = useState("My Custom Hypertrophy");
  const [selectedRoutines, setSelectedRoutines] = useState<RoutineItem[]>([]);

  const handleHover = () => {
    playButtonHover();
  };

  // Filter exercises to display on selector
  const filteredExercises = useMemo(() => {
    let result = EXERCISE_DATABASE;
    if (activeGroup !== "All") {
      result = result.filter((e) => e.muscleGroup === activeGroup);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, activeGroup]);

  // Add exercise to checklist
  const addExercise = (name: string, description: string) => {
    setSelectedRoutines((prev) => {
      // Avoid duplicate names in same routine
      if (prev.some((r) => r.name === name)) return prev;
      return [...prev, { name, sets: 3, reps: "10-12", description }];
    });
  };

  // Remove exercise from checklist
  const removeExercise = (idx: number) => {
    setSelectedRoutines((prev) => prev.filter((_, i) => i !== idx));
  };

  // Modify sets / reps values
  const updateRoutineField = (idx: number, field: "sets" | "reps", value: any) => {
    setSelectedRoutines((prev) => {
      const copy = [...prev];
      if (field === "sets") {
        copy[idx] = { ...copy[idx], sets: parseInt(value) || 1 };
      } else {
        copy[idx] = { ...copy[idx], reps: value };
      }
      return copy;
    });
  };

  // Compile and Save Routine
  const handleSaveRoutine = () => {
    if (selectedRoutines.length === 0) {
      alert("Please add at least one exercise to compile.");
      return;
    }

    const payload = {
      day: routineDay,
      name: routineName,
      routines: selectedRoutines,
    };

    saveCustomRoutine(payload);
    setSelectedRoutines([]);
  };

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-6xl animate-page-enter font-mono text-xs">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 block mb-2">
          COMPILER ENGINE // ROUTINE LAB
        </span>
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight flex items-center justify-center gap-2">
          <Dumbbell className="text-primary w-8 h-8" />
          Routine <span className="text-primary neon-text">Builder</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
        <p className="text-muted-foreground max-w-lg mx-auto mt-3 text-[10px] leading-relaxed">
          Select mechanical movements, assign load parameters, and compile custom workout routines to inject into your calendar database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Exercise Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-xl p-5 relative">
            <CornerElements />
            
            <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">
              Step 1: Select Exercises
            </h3>

            {/* Search */}
            <input
              type="text"
              placeholder="Search exercise catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-cyber-black border border-border/60 rounded-lg px-3 py-2.5 mb-4 text-xs font-mono focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/30"
            />

            {/* Muscle groups filter pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {MUSCLE_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all duration-300 ${
                    activeGroup === g
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-transparent border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Exercise scrollable grid list */}
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scroll">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 border border-border/20 bg-cyber-black/40 hover:border-primary/30 rounded-lg transition-all duration-300"
                >
                  <div>
                    <p className="font-bold text-foreground">{ex.name}</p>
                    <div className="flex gap-2 mt-1 font-mono text-[8px] text-muted-foreground">
                      <span>EQUIPMENT: {ex.equipment.toUpperCase()}</span>
                      <span>&bull;</span>
                      <span>MUSCLE: {ex.muscleGroup.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => addExercise(ex.name, ex.description)}
                    onMouseEnter={handleHover}
                    className="p-1.5 rounded bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_8px_rgba(24,206,242,0.2)] transition-all duration-300 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}

              {filteredExercises.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No movements matches your selection criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Routine compiler layout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-xl p-5 relative flex flex-col min-h-[460px] justify-between">
            <CornerElements />

            <div>
              <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">
                Step 2: Compile Routine Specifications
              </h3>

              {/* Day Selector */}
              <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-[9px]">
                <div className="space-y-1">
                  <span className="text-muted-foreground uppercase">TARGET DAY</span>
                  <select
                    value={routineDay}
                    onChange={(e) => setRoutineDay(e.target.value)}
                    className="w-full bg-cyber-black border border-border/60 rounded px-2 py-2 focus:outline-none focus:border-primary text-foreground font-mono"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground uppercase">ROUTINE ID</span>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="w-full bg-cyber-black border border-border/60 rounded px-2.5 py-1.5 focus:outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
              </div>

              {/* Routine Checklist List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scroll mb-4">
                {selectedRoutines.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-border/30 bg-cyber-black/70 rounded-lg flex flex-col gap-2 relative group"
                  >
                    <div className="flex justify-between items-center pr-6">
                      <span className="font-bold text-foreground truncate">{item.name}</span>
                      <button
                        onClick={() => removeExercise(idx)}
                        onMouseEnter={handleHover}
                        className="absolute right-3 top-3 text-muted-foreground/40 hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[9px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">SETS</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={item.sets}
                          onChange={(e) => updateRoutineField(idx, "sets", e.target.value)}
                          className="w-12 bg-cyber-black border border-border/60 rounded px-1.5 py-1 text-center text-foreground font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">REPS</span>
                        <input
                          type="text"
                          value={item.reps}
                          onChange={(e) => updateRoutineField(idx, "reps", e.target.value)}
                          className="w-16 bg-cyber-black border border-border/60 rounded px-1.5 py-1 text-center text-foreground font-mono text-[9px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {selectedRoutines.length === 0 && (
                  <div className="border border-dashed border-border/40 rounded-xl p-8 text-center text-muted-foreground font-mono text-[10px] flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-6 h-6 text-muted-foreground/30" />
                    <span>Routines checklist empty. Click &quot;+&quot; on exercises to begin constructing load modules.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Compile save trigger */}
            <Button
              onClick={handleSaveRoutine}
              onMouseEnter={handleHover}
              disabled={selectedRoutines.length === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold uppercase tracking-widest py-3 mt-4 flex items-center justify-center gap-1.5 rounded-lg shadow-[0_0_12px_rgba(24,206,242,0.15)] disabled:opacity-30 disabled:pointer-events-none"
            >
              <Save size={14} />
              COMPILE AND SAVE ROUTINE
            </Button>

          </div>
        </div>
      </div>
    </section>
  );
};

export default RoutineBuilderPage;

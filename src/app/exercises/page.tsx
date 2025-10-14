"use client";

import React, { useState, useMemo } from "react";
import { EXERCISE_DATABASE, MUSCLE_GROUPS } from "@/constants/exercises";
import { Search, Dumbbell, Star, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

const DifficultyStars = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((i) => (
      <Star
        key={i}
        size={12}
        className={i <= level ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
      />
    ))}
  </div>
);

const ExercisesPage = () => {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let result = EXERCISE_DATABASE;
    if (activeGroup !== "All") {
      result = result.filter((e) => e.muscleGroup === activeGroup);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscleGroup.toLowerCase().includes(q) ||
          e.equipment.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeGroup]);

  const groupColors: Record<string, string> = {
    Chest: "var(--cyber-blue-bright)",
    Back: "var(--cyber-violet)",
    Legs: "var(--cyber-lime)",
    Arms: "var(--cyber-magenta)",
    Shoulders: "var(--cyber-gold)",
    Core: "var(--cyber-orange)",
  };

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-6xl animate-page-enter font-mono">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/70 block mb-3">
          TRAINING DATABASE
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
          <span className="text-foreground">Exercise </span>
          <span className="text-primary neon-text">Library</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
        <p className="text-muted-foreground max-w-lg mx-auto text-xs">
          Browse {EXERCISE_DATABASE.length} exercises with detailed form tips, muscle targeting, and recommended programming.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises, muscle groups, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cyber-terminal-bg border border-border rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-mono border transition-all duration-300 ${
                activeGroup === group
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(24,206,242,0.15)]"
                  : "bg-transparent border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {group.toUpperCase()}
            </button>
          ))}
        </div>

        <p className="text-center text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">
          Showing {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((exercise) => {
          const isExpanded = expandedId === exercise.id;
          const color = groupColors[exercise.muscleGroup] || "var(--cyber-blue-bright)";

          return (
            <div
              key={exercise.id}
              className="relative glass-card rounded-xl overflow-hidden card-3d group"
            >
              {/* Header bar */}
              <div
                className="flex items-center justify-between px-4 py-2 border-b"
                style={{ borderColor: `${color}20`, background: `${color}08` }}
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color }}>
                  {exercise.muscleGroup}
                </span>
                <DifficultyStars level={exercise.difficulty} />
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-xs">{exercise.name}</h3>
                    <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                      {exercise.equipment}
                    </p>
                  </div>
                  <div
                    className="p-1.5 rounded-lg border shrink-0"
                    style={{ borderColor: `${color}30`, background: `${color}10`, color }}
                  >
                    <Dumbbell size={14} />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  {exercise.description}
                </p>

                {/* Quick stats */}
                <div className="flex gap-2 mb-3">
                  <div className="px-2 py-1 rounded text-[9px] font-mono font-bold" style={{ background: `${color}15`, color }}>
                    {exercise.recommendedSets} SETS
                  </div>
                  <div className="px-2 py-1 rounded text-[9px] font-mono font-bold bg-muted/30 text-muted-foreground">
                    {exercise.recommendedReps} REPS
                  </div>
                  {exercise.secondaryMuscles.length > 0 && (
                    <div className="px-2 py-1 rounded text-[9px] font-mono bg-muted/20 text-muted-foreground/70">
                      +{exercise.secondaryMuscles.length} SECONDARY
                    </div>
                  )}
                </div>

                {/* Expand/collapse */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                  className="flex items-center gap-1 text-[9px] font-mono text-primary/70 hover:text-primary transition-colors cursor-pointer"
                >
                  <BookOpen size={11} />
                  {isExpanded ? "HIDE DETAILS" : "FORM TIPS"}
                  {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>

                {isExpanded && (
                  <div className="mt-3 animate-fadeIn">
                    <div className="bg-muted/20 border border-border/20 rounded-lg p-3">
                      <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1.5 tracking-wider">FORM TIPS</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{exercise.formTips}</p>

                      {exercise.secondaryMuscles.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/20">
                          <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1 tracking-wider">SECONDARY MUSCLES</p>
                          <div className="flex flex-wrap gap-1">
                            {exercise.secondaryMuscles.map((m) => (
                              <span key={m} className="px-2 py-0.5 rounded text-[8px] font-mono bg-primary/10 text-primary border border-primary/20">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-2 h-2 border-r border-t" style={{ borderColor: `${color}30` }} />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b" style={{ borderColor: `${color}30` }} />
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono text-xs">No exercises match your search.</p>
          <button onClick={() => { setSearch(""); setActiveGroup("All"); }} className="text-primary text-xs font-mono mt-2 hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
};

export default ExercisesPage;

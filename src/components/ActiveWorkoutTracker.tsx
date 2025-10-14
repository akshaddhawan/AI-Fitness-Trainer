"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import CornerElements from "./CornerElements";
import { Button } from "./ui/button";
import { playTickSound, playAlarmSound, playSuccessSound } from "@/lib/audio";
import { Play, Pause, SkipForward, Check, Award, Flame, Dumbbell, Timer } from "lucide-react";

interface ActiveWorkoutTrackerProps {
  workoutDay: {
    day: string;
    routines: Array<{
      name: string;
      sets: number;
      reps: number;
      description?: string;
    }>;
  };
  onClose: () => void;
}

const ActiveWorkoutTracker = ({ workoutDay, onClose }: ActiveWorkoutTrackerProps) => {
  const { completeWorkoutSession } = useAppServices();
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Track completed sets for each exercise: Array of boolean arrays
  const [completedSets, setCompletedSets] = useState<boolean[][]>(
    workoutDay.routines.map(r => Array(r.sets).fill(false))
  );

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0); // 0 means timer not running
  const timerMax = 60; // Default 60s rest
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Success screen state
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const currentExercise = workoutDay.routines[currentIdx];
  const totalExercises = workoutDay.routines.length;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Tick Logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          if (next <= 3 && next > 0) {
            playTickSound(); // Tick sound for final 3 seconds
          }
          if (next === 0) {
            playAlarmSound(); // Alarm beep when finished
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const toggleSet = (setIdx: number) => {
    playTickSound();
    const newSets = [...completedSets];
    const isNowCompleted = !newSets[currentIdx][setIdx];
    newSets[currentIdx][setIdx] = isNowCompleted;
    setCompletedSets(newSets);

    // If marked completed, start the rest timer!
    if (isNowCompleted) {
      setTimeLeft(timerMax);
      setTimerActive(true);
    }
  };

  const handleSkipTimer = () => {
    playTickSound();
    setTimeLeft(0);
    setTimerActive(false);
  };

  const handleToggleTimer = () => {
    playTickSound();
    setTimerActive(!timerActive);
  };

  const handleNext = () => {
    playTickSound();
    setTimeLeft(0);
    setTimerActive(false);
    if (currentIdx < totalExercises - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    playTickSound();
    setTimeLeft(0);
    setTimerActive(false);
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleFinish = () => {
    playSuccessSound();
    completeWorkoutSession();
    setWorkoutComplete(true);
  };

  const isExerciseDone = completedSets[currentIdx].every(Boolean);

  // Success Splash Screen
  if (workoutComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 font-mono">
        <div className="relative border border-primary w-full max-w-lg p-8 rounded-lg bg-cyber-terminal-bg text-center shadow-[0_0_30px_rgba(24,206,242,0.2)] animate-fadeIn">
          <CornerElements />
          
          <div className="mx-auto bg-primary/10 border border-primary/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Award className="w-10 h-10 text-primary animate-bounce" />
          </div>

          <h1 className="text-3xl font-extrabold text-foreground tracking-wider mb-2">
            WORKOUT <span className="text-primary">SECURED</span>
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
            TRANS-CALORIC MATRIX COMPLETED
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-4"></div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-primary/5 border border-primary/20 rounded p-4 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block mb-1">XP EARNED</span>
              <span className="text-xl font-bold text-primary font-mono">+150 XP</span>
            </div>
            
            <div className="bg-orange-500/5 border border-orange-500/20 rounded p-4 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block mb-1">STREAK BADGE</span>
              <span className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1 font-mono">
                <Flame className="w-5 h-5 fill-orange-500" />
                STREAK ACTIVE
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-4"></div>

          <p className="text-xs text-muted-foreground mb-8">
            Your physiological parameters have been updated and synchronized with local storage. Returning to profile...
          </p>

          <Button 
            onClick={onClose} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
          >
            DISMISS CONSOLE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col pt-24 pb-12 px-4 overflow-y-auto font-mono">
      <div className="container mx-auto max-w-4xl h-full flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs text-primary font-bold uppercase tracking-wider">&gt; ACTIVE SESSION LOCK</span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              DAY: <span className="text-primary">{workoutDay.day.toUpperCase()}</span>
            </h2>
          </div>
          <Button 
            onClick={onClose}
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs py-1 h-auto cursor-pointer"
          >
            ABORT WORKOUT
          </Button>
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow items-stretch">
          {/* LEFT COLUMN: EXERCISES LIST (4 cols) */}
          <div className="md:col-span-4 border border-border p-4 bg-card/20 rounded-lg flex flex-col">
            <h3 className="text-xs uppercase text-muted-foreground tracking-wider mb-4 border-b border-border/40 pb-2">
              EXERCISE PROTOCOLS
            </h3>
            
            <div className="space-y-2 flex-grow overflow-y-auto pr-1">
              {workoutDay.routines.map((routine, idx) => {
                const isActive = idx === currentIdx;
                const isCompleted = completedSets[idx].every(Boolean);
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      playTickSound();
                      setCurrentIdx(idx);
                      setTimeLeft(0);
                      setTimerActive(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded text-left border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_8px_rgba(24,206,242,0.15)]"
                        : isCompleted
                          ? "bg-green-500/5 border-green-500/20 text-green-500/70"
                          : "bg-cyber-terminal-bg/40 border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold truncate">{routine.name}</p>
                      <p className="text-[10px] mt-0.5">{routine.sets} sets • {routine.reps} reps</p>
                    </div>
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono shrink-0">
                        {completedSets[idx].filter(Boolean).length}/{routine.sets} SETS
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE EXERCISE FOCUS & TIMER (8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            {/* ACTIVE CARD */}
            <div className="relative border border-border p-6 rounded-lg bg-card/25 backdrop-blur-sm flex-grow flex flex-col">
              <CornerElements />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r border-t border-primary/50" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                    EXERCISE {currentIdx + 1} OF {totalExercises}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-2">{currentExercise.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-cyber-terminal-bg rounded border border-border/60 text-xs text-primary font-mono">
                  <Dumbbell size={14} />
                  <span>{currentExercise.sets}S x {currentExercise.reps}R</span>
                </div>
              </div>

              {currentExercise.description && (
                <p className="text-xs text-muted-foreground font-mono leading-relaxed bg-background/40 p-3.5 rounded border border-border/30 mb-6">
                  &gt; Coach Advice: {currentExercise.description}
                </p>
              )}

              {/* SETS PROGRESS CHECKBOXES */}
              <div className="flex-grow flex flex-col justify-center items-center py-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">MARK SETS COMPLETE</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {completedSets[currentIdx].map((isSetDone, setIdx) => (
                    <button
                      key={setIdx}
                      onClick={() => toggleSet(setIdx)}
                      className={`w-14 h-14 rounded-full border-2 font-mono font-bold flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer group ${
                        isSetDone
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(24,206,242,0.4)]"
                          : "bg-cyber-terminal-bg border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider opacity-60">SET</span>
                      <span className="text-md font-extrabold mt-0.5">{setIdx + 1}</span>
                      {isSetDone && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-background">
                          <Check size={8} className="stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-6">
                <Button
                  onClick={handleBack}
                  disabled={currentIdx === 0}
                  variant="outline"
                  className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/10 text-xs py-2 px-4"
                >
                  Previous
                </Button>

                {currentIdx < totalExercises - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isExerciseDone}
                    className={`text-xs py-2 px-6 ${
                      isExerciseDone
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted border border-border/20 text-muted-foreground"
                    }`}
                  >
                    Next Exercise
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-6"
                  >
                    Finish Workout
                  </Button>
                )}
              </div>
            </div>

            {/* REST TIMER COMPONENT */}
            {timeLeft > 0 && (
              <div className="relative border border-primary/30 p-5 rounded-lg bg-cyber-terminal-bg shadow-[0_0_15px_rgba(24,206,242,0.06)] flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center bg-card">
                    <Timer className={`w-6 h-6 text-primary ${timerActive ? "animate-pulse" : ""}`} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block tracking-wider">REST INTERVAL</span>
                    <span className="text-xl font-bold font-mono text-primary">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTimer}
                    className="p-2.5 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                  >
                    {timerActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={handleSkipTimer}
                    className="p-2.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutTracker;

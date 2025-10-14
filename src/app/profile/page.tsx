"use client";

import React, { useState, useMemo } from "react";
import { useAppServices, ACHIEVEMENTS_DATABASE, Achievement } from "@/providers/AppServicesProvider";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import StatsRing from "@/components/StatsRing";
import ProgressChart from "@/components/ProgressChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon, Trophy, Quote, Sparkles, Lock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import IntakeTracker from "@/components/IntakeTracker";
import ActiveWorkoutTracker from "@/components/ActiveWorkoutTracker";
import { playButtonHover } from "@/lib/audio";

const ProfilePage = () => {
  const { user, plans: allPlans, stats, achievements } = useAppServices();
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);
  const [activeSessionDay, setActiveSessionDay] = useState<any | null>(null);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  const handleHover = () => {
    playButtonHover();
  };

  // Curated motivational quotes
  const quotes = useMemo(() => [
    "The only bad workout is the one that didn't happen.",
    "Brace your core, lock your sights, and crush your goals.",
    "Consistency beats intensity. Level up every single day.",
    "Hydrate like your gains depend on it. System online.",
    "Make sweat your energy. Rebuild your hardware.",
  ], []);

  const quoteOfTheDay = useMemo(() => {
    const day = new Date().getDate();
    return quotes[day % quotes.length];
  }, [quotes]);

  // Compute stats ring progress
  const level = stats?.level || 1;
  const xp = stats?.xp || 0;
  const xpInCurrentLevel = xp - (level - 1) * 500;
  const levelProgress = Math.min(100, Math.max(0, (xpInCurrentLevel / 500) * 100));

  const targetCal = currentPlan?.dietPlan?.dailyCalories || 2000;
  const calPercent = Math.min(100, ((stats?.dailyCaloriesLogged || 0) / targetCal) * 100);
  const waterPercent = Math.min(100, ((stats?.dailyWater || 0) / 3000) * 100);
  const streakPercent = Math.min(100, ((stats?.streak || 0) / 7) * 100);

  // Retrieve last 3 unlocked achievements
  const recentAchievements = useMemo(() => {
    if (!achievements) return [];
    
    // Sort unlocked badges by date or value (since date is localedatestring, we take last 3 keys)
    const keys = Object.keys(achievements).slice(-3);
    const list: (Achievement & { date: string })[] = [];
    
    keys.forEach(k => {
      const match = ACHIEVEMENTS_DATABASE.find(b => b.id === k);
      if (match) {
        list.push({ ...match, date: achievements[k] });
      }
    });
    
    return list.reverse();
  }, [achievements]);

  return (
    <section className="relative z-10 pt-6 pb-32 container mx-auto px-4 max-w-6xl font-mono">
      {/* Profile Header Block */}
      <ProfileHeader user={user} />

      {/* Main Grid: Left is Content, Right is Stats/Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Plans & Details */}
        <div className="lg:col-span-8 space-y-6">
          {allPlans && allPlans.length > 0 && currentPlan && (
            <IntakeTracker targetCalories={currentPlan.dietPlan.dailyCalories} />
          )}

          {allPlans && allPlans.length > 0 ? (
            <div className="space-y-6">
              {/* PLAN SELECTOR */}
              <div className="relative glass-card p-6 rounded-xl">
                <CornerElements />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold tracking-tight uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Your Fitness Plans</span>
                  </h2>
                  <div className="text-[10px] text-muted-foreground">
                    ACTIVE PLANS: {allPlans.filter(p => p.isActive).length}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allPlans.map((plan) => (
                    <Button
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      onMouseEnter={handleHover}
                      className={`text-[10px] uppercase font-bold tracking-wider border hover:text-white rounded-lg h-auto py-2 px-4 ${
                        selectedPlanId === plan._id || (!selectedPlanId && plan.isActive)
                          ? "bg-primary/20 text-primary border-primary shadow-[0_0_8px_rgba(24,206,242,0.1)]"
                          : "bg-transparent border-border hover:border-primary/50"
                      }`}
                    >
                      {plan.name}
                      {plan.isActive && (
                        <span className="ml-2 bg-cyber-lime/20 text-cyber-lime text-[8px] font-bold px-1.5 py-0.5 rounded border border-cyber-lime/30">
                          ACTIVE
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* PLAN DETAILS */}
              {currentPlan && (
                <div className="relative glass-card rounded-xl p-6">
                  <CornerElements />

                  <div className="flex items-center gap-2 mb-6 border-b border-border/20 pb-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      SPECIFICATIONS: <span className="text-primary">{currentPlan.name}</span>
                    </h3>
                  </div>

                  <Tabs defaultValue="workout" className="w-full">
                    <TabsList className="mb-6 w-full grid grid-cols-2 bg-cyber-black/60 border border-border/40 p-1 rounded-lg">
                      <TabsTrigger
                        value="workout"
                        onMouseEnter={handleHover}
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px] uppercase tracking-wider py-2"
                      >
                        <DumbbellIcon className="mr-2 w-3.5 h-3.5" />
                        Workout Plan
                      </TabsTrigger>

                      <TabsTrigger
                        value="diet"
                        onMouseEnter={handleHover}
                        className="data-[state=active]:bg-cyber-violet/20 data-[state=active]:text-cyber-violet font-bold text-[10px] uppercase tracking-wider py-2"
                      >
                        <AppleIcon className="mr-2 h-3.5 w-3.5" />
                        Diet Plan
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="workout">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-cyber-black/40 border border-border/40 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            <span className="text-[10px] text-muted-foreground uppercase">
                              SCHEDULE: {currentPlan.workoutPlan.schedule.join(", ")}
                            </span>
                          </div>
                          <Button
                            onClick={() => {
                              const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long" });
                              const matchDay = currentPlan.workoutPlan.exercises.find((e: any) => e.day.toLowerCase() === todayStr.toLowerCase())
                                || currentPlan.workoutPlan.exercises[0];
                              if (matchDay) {
                                setActiveSessionDay(matchDay);
                              }
                            }}
                            onMouseEnter={handleHover}
                            className="bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold tracking-wider uppercase py-2 px-4 shadow-[0_0_12px_rgba(24,206,242,0.2)] h-auto rounded-lg"
                          >
                            <DumbbellIcon className="mr-1.5 h-3.5 w-3.5" />
                            START ACTIVE WORKOUT
                          </Button>
                        </div>

                        <Accordion type="multiple" className="space-y-3">
                          {currentPlan.workoutPlan.exercises.map((exerciseDay: any, index: number) => (
                            <AccordionItem
                              key={index}
                              value={exerciseDay.day}
                              className="border border-border/40 rounded-lg overflow-hidden"
                            >
                              <AccordionTrigger 
                                onMouseEnter={handleHover}
                                className="px-4 py-3 hover:no-underline hover:bg-primary/10 font-bold text-xs uppercase"
                              >
                                <div className="flex justify-between w-full items-center">
                                  <span className="text-primary">{exerciseDay.day}</span>
                                  <div className="text-[10px] text-muted-foreground font-normal">
                                    {exerciseDay.routines.length} EXERCISES
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="pb-4 px-4 bg-cyber-black/20">
                                <div className="space-y-2 mt-3">
                                  {exerciseDay.routines.map((routine: any, routineIndex: number) => (
                                    <div
                                      key={routineIndex}
                                      className="border border-border/20 rounded p-3 bg-cyber-black/40 flex flex-col gap-1.5"
                                    >
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-foreground text-xs">
                                          {routine.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold">
                                          <div className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                            {routine.sets} SETS
                                          </div>
                                          <div className="px-2 py-0.5 rounded bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20">
                                            {routine.reps} REPS
                                          </div>
                                        </div>
                                      </div>
                                      {routine.description && (
                                        <p className="text-[10px] text-muted-foreground leading-normal">
                                          {routine.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </TabsContent>

                    <TabsContent value="diet">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4 bg-cyber-black/40 border border-border/40 p-4 rounded-lg">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            DAILY TARGET CALORIES
                          </span>
                          <div className="text-base font-extrabold text-primary shadow-glow">
                            {currentPlan.dietPlan.dailyCalories} KCAL
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentPlan.dietPlan.meals.map((meal: any, index: number) => (
                            <div
                              key={index}
                              className="border border-border/30 rounded-lg bg-cyber-black/40 p-4 relative"
                            >
                              {/* Corner lines */}
                              <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-border/30" />
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-border/30" />

                              <div className="flex items-center gap-2 mb-3 border-b border-border/10 pb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <h4 className="font-bold text-primary text-xs uppercase">{meal.name}</h4>
                              </div>
                              <ul className="space-y-2">
                                {meal.foods.map((food: string, foodIndex: number) => (
                                  <li
                                    key={foodIndex}
                                    className="flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed"
                                  >
                                    <span className="text-[8px] text-primary font-bold bg-primary/10 border border-primary/20 px-1 rounded mt-0.5">
                                      {String(foodIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span>{food}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          ) : (
            <NoFitnessPlan />
          )}
        </div>

        {/* RIGHT COLUMN: Stats Rings, Graph, Recent Achievements */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stats circular rings card */}
          <div className="glass-card rounded-xl p-5 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />
            
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-4">
              Biometrics Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <StatsRing
                percentage={levelProgress}
                size={85}
                strokeWidth={7}
                color="var(--cyber-blue-bright)"
                glowColor="rgba(24, 206, 242, 0.3)"
                label="LVL XP"
                value={`${Math.round(levelProgress)}%`}
              />
              <StatsRing
                percentage={waterPercent}
                size={85}
                strokeWidth={7}
                color="var(--cyber-violet)"
                glowColor="rgba(139, 92, 246, 0.3)"
                label="H2O TARGET"
                value={`${stats?.dailyWater || 0}ml`}
              />
              <StatsRing
                percentage={calPercent}
                size={85}
                strokeWidth={7}
                color="var(--cyber-orange)"
                glowColor="rgba(249, 115, 22, 0.3)"
                label="CAL TARGET"
                value={`${stats?.dailyCaloriesLogged || 0}kcal`}
              />
              <StatsRing
                percentage={streakPercent}
                size={85}
                strokeWidth={7}
                color="var(--cyber-lime)"
                glowColor="rgba(132, 204, 22, 0.3)"
                label="STREAK"
                value={`${stats?.streak || 0}d`}
              />
            </div>
          </div>

          {/* Weekly Progress Canvas Graph */}
          <ProgressChart />

          {/* Recent Achievements */}
          <div className="glass-card rounded-xl p-5 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-cyber-gold" />
                Recent Trophies
              </h3>
              <Button 
                asChild 
                variant="link" 
                onMouseEnter={handleHover}
                className="text-primary text-[9px] uppercase tracking-wider p-0 h-auto"
              >
                <a href="/achievements">View All</a>
              </Button>
            </div>

            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-2 border border-border/20 bg-cyber-black/40 rounded-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full border border-primary/20 bg-cyber-black flex items-center justify-center text-base">
                      {badge.icon}
                    </div>
                    <div className="min-w-0 flex-1 font-mono text-[9px]">
                      <p className="font-bold text-foreground truncate uppercase">{badge.title}</p>
                      <p className="text-muted-foreground truncate">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 font-mono text-[10px] text-muted-foreground">
                <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                No achievements unlocked. Start working out or logging metrics to earn badges!
              </div>
            )}
          </div>

          {/* Quote of the Day */}
          <div className="glass-card rounded-xl p-5 relative font-mono text-[10px] leading-relaxed border border-border/30 bg-gradient-to-br from-cyber-black to-cyber-dark/30 flex gap-3">
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />
            
            <Quote className="w-5 h-5 text-primary shrink-0 opacity-40 mt-0.5" />
            <div className="space-y-1">
              <p className="text-muted-foreground italic font-medium leading-relaxed">
                &quot;{quoteOfTheDay}&quot;
              </p>
              <p className="text-[8px] text-primary/60 uppercase tracking-widest font-bold">
                SYSTEM MOTIVATION LOG
              </p>
            </div>
          </div>

        </div>

      </div>

      {activeSessionDay && (
        <ActiveWorkoutTracker
          workoutDay={activeSessionDay}
          onClose={() => setActiveSessionDay(null)}
        />
      )}
    </section>
  );
};

export default ProfilePage;

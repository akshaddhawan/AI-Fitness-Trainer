"use client";

import React, { use } from "react";
import { USER_PROGRAMS } from "@/constants";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon, ArrowLeft, Clock, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ProgramDetailPage = ({ params }: PageProps) => {
  const router = useRouter();
  const { id } = use(params);
  
  const programId = parseInt(id);
  const program = USER_PROGRAMS.find((p) => p.id === programId);

  if (!program) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-mono text-destructive font-bold mb-4">404 - PROGRAM NOT FOUND</h1>
        <p className="text-muted-foreground mb-8">The requested fitness program could not be located in the database.</p>
        <Button onClick={() => router.push("/")} className="bg-primary text-primary-foreground font-mono">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4 max-w-5xl">
      {/* BACK BUTTON */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
          <ArrowLeft size={16} />
          <span>Back to Programs</span>
        </Link>
      </div>

      {/* USER PROFILE CARD */}
      <div className="mb-10 relative backdrop-blur-sm border border-border p-6 rounded-lg bg-card/40">
        <CornerElements />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="relative w-24 h-24 overflow-hidden rounded-lg border border-border">
              <img
                src={program.profilePic}
                alt={program.first_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary border-2 border-background animate-pulse"></div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight font-mono">
                {program.first_name}<span className="text-primary">.exe</span>
              </h1>
              <div className="flex items-center bg-primary/10 border border-primary/20 rounded px-3 py-1 self-start md:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-primary mr-2" />
                <p className="text-xs font-mono text-primary uppercase">{program.fitness_goal}</p>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-30 my-2"></div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground mt-2">
              <div>AGE: {program.age} YRS</div>
              <div className="hidden sm:inline">•</div>
              <div>HEIGHT: {program.height}</div>
              <div className="hidden sm:inline">•</div>
              <div>WEIGHT: {program.weight}</div>
              <div className="hidden sm:inline">•</div>
              <div>LEVEL: {program.fitness_level.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS VIEW */}
      <div className="space-y-8">
        <div className="relative backdrop-blur-sm border border-border rounded-lg p-6 bg-card/25">
          <CornerElements />

          <Tabs defaultValue="workout" className="w-full">
            <TabsList className="mb-6 w-full grid grid-cols-2 bg-cyber-terminal-bg border">
              <TabsTrigger
                value="workout"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono text-sm py-3"
              >
                <DumbbellIcon className="mr-2 size-4" />
                Workout Schedule
              </TabsTrigger>

              <TabsTrigger
                value="diet"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono text-sm py-3"
              >
                <AppleIcon className="mr-2 h-4 w-4" />
                Nutrition Program
              </TabsTrigger>
            </TabsList>

            {/* WORKOUT TAB */}
            <TabsContent value="workout">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-mono text-foreground mb-2">
                    {program.workout_plan.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed bg-background/30 p-4 rounded border border-border/40">
                    <span className="text-primary font-bold">&gt; </span>
                    {program.workout_plan.description}
                  </p>
                </div>

                <div className="h-px w-full bg-border/40 my-4"></div>

                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span>TRAINING FREQUENCY: {program.workout_days} DAYS A WEEK ({program.equipment_access})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {program.workout_plan.weekly_schedule.map((session, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 bg-background/50 hover:border-primary/30 transition-all duration-300 relative group"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-l border-t border-primary/50 group-hover:border-primary" />
                      <div className="flex justify-between items-start mb-3 font-mono">
                        <span className="text-primary font-bold text-sm">{session.day.toUpperCase()}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} className="text-secondary" />
                          {session.duration}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">{session.focus}</h4>
                      <p className="text-xs text-muted-foreground font-mono mt-2">
                        &gt; Focus: Target muscle groups & active recovery routines.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* DIET TAB */}
            <TabsContent value="diet">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/40 p-4 rounded border border-border/45">
                  <div>
                    <h3 className="text-md font-bold font-mono text-foreground">{program.diet_plan.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      RESTRICTIONS: {program.dietary_restrictions || "None"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase block">Calorie Target</span>
                      <span className="text-lg font-bold text-primary">{program.diet_plan.daily_calories}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Flame size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 font-mono text-center">
                  <div className="bg-primary/5 border border-primary/10 rounded p-2">
                    <span className="text-[10px] text-muted-foreground uppercase block">Protein</span>
                    <span className="text-sm font-semibold text-primary">{program.diet_plan.macros.protein}</span>
                  </div>
                  <div className="bg-secondary/5 border border-secondary/10 rounded p-2">
                    <span className="text-[10px] text-muted-foreground uppercase block">Carbs</span>
                    <span className="text-sm font-semibold text-secondary">{program.diet_plan.macros.carbs}</span>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded p-2">
                    <span className="text-[10px] text-muted-foreground uppercase block">Fats</span>
                    <span className="text-sm font-semibold text-primary">{program.diet_plan.macros.fats}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-mono text-primary font-bold">&gt; MEAL STRUCTURE EXAMPLES:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {program.diet_plan.meal_examples.map((meal, index) => (
                      <div
                        key={index}
                        className="border border-border/80 rounded-lg p-4 bg-background/30 hover:border-primary/20 transition-all duration-300 relative group"
                      >
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-r border-t border-primary/40" />
                        <h5 className="font-mono text-xs text-primary font-bold mb-1.5">{meal.meal.toUpperCase()}</h5>
                        <p className="text-sm text-foreground">{meal.example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-border/40 my-4"></div>

                <p className="text-xs text-muted-foreground font-mono leading-relaxed bg-background/20 p-3.5 rounded border border-border/30">
                  <span className="text-secondary font-bold font-mono">&gt; Coach Summary: </span>
                  {program.diet_plan.description}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA TO BUILD PROGRAM */}
        <div className="text-center bg-card/30 border border-border p-8 rounded-lg relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl font-bold font-mono mb-2">Want a similar program designed for your body?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6 text-sm">
            Launch our AI assistant call. Our voice bot will take your stats, goals, injuries, and dietary preferences, and generate a customized program instantly.
          </p>
          <Link href="/generate-program">
            <Button className="bg-primary text-primary-foreground font-mono px-8 py-6 text-md shadow-[0_0_15px_rgba(24,206,242,0.2)] hover:shadow-[0_0_25px_rgba(24,206,242,0.4)]">
              Build Your Custom Program
              <Sparkles size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramDetailPage;

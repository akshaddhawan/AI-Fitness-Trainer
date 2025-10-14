"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Dumbbell,
  Sparkles,
  Users,
  Clock,
  AppleIcon,
  ShieldIcon,
} from "lucide-react";
import { USER_PROGRAMS } from "@/constants";
import { playButtonHover } from "@/lib/audio";

interface ProgramCardProps {
  program: typeof USER_PROGRAMS[0];
  index: number;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleHover = () => {
    playButtonHover();
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Card
        className="bg-card/90 backdrop-blur-sm border border-border/60 hover:border-primary/50 transition-all duration-300 overflow-hidden card-3d group h-full flex flex-col justify-between"
        style={{
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}
      >
        <div>
          {/* Card header with user info */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-cyber-black/40 font-mono text-[9px]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-bold">USER_STATION.{program.id}</span>
            </div>
            <div className="text-muted-foreground uppercase font-bold">
              {program.fitness_level}
            </div>
          </div>

          <CardHeader className="pt-5 px-5 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-border/60 p-0.5 bg-cyber-black">
                <img
                  src={program.profilePic}
                  alt={`${program.first_name}`}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <div>
                <CardTitle className="text-base text-foreground font-bold font-mono">
                  {program.first_name}
                  <span className="text-primary">.exe</span>
                </CardTitle>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>{program.age}y &bull; {program.workout_days} days/wk</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 font-mono text-[9px]">
              <div className="px-2 py-0.5 bg-primary/10 rounded border border-primary/20 text-primary flex items-center gap-1 font-bold">
                <Sparkles className="h-3 w-3" />
                {program.fitness_goal.toUpperCase()}
              </div>
              <div className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                v1.2.4
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-2 font-mono text-[10px]">
            {/* Program details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-primary/10 text-primary mt-0.5">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">
                    {program.workout_plan.title}
                  </h3>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {program.equipment_access}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-cyber-violet/10 text-cyber-violet mt-0.5">
                  <AppleIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{program.diet_plan.title}</h3>
                  <p className="text-[9px] text-muted-foreground truncate">
                    Macronutrients Optimized
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-cyber-lime/10 text-cyber-lime mt-0.5">
                  <ShieldIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">Active Safety Protocols</h3>
                  <p className="text-[9px] text-muted-foreground truncate">
                    Load Safeguards Configured
                  </p>
                </div>
              </div>
            </div>

            {/* Program description */}
            <div className="mt-4 pt-4 border-t border-border/20 text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold">&gt; </span>
              {program.workout_plan.description.substring(0, 110)}...
            </div>
          </CardContent>
        </div>

        <CardFooter className="px-5 py-4 border-t border-border/20 mt-4">
          <Link href={`/programs/${program.id}`} className="w-full" onClick={handleHover}>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] uppercase font-bold tracking-wider py-2 rounded-lg">
              View Specs
              <ChevronRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

const UserPrograms = () => {
  const handleHover = () => {
    playButtonHover();
  };

  return (
    <div className="w-full pb-20 pt-10 relative font-mono">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Gallery Title/Header */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/70 block mb-3">
            COMMUNITY PORTAL
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase font-mono">
            User <span className="text-primary neon-text">Program Database</span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
          <p className="text-muted-foreground max-w-lg mx-auto text-xs">
            Review telemetry and schedules of fitness programs generated by other active users.
          </p>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USER_PROGRAMS.map((program, idx) => (
            <ProgramCard
              key={program.id}
              program={program}
              index={idx}
            />
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-16 text-center">
          <Link href="/generate-program" onClick={handleHover}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/95 px-8 py-5 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(24,206,242,0.25)] rounded-lg"
            >
              Generate Your Program
              <Sparkles className="ml-2 h-4 w-4 animate-glow" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-[10px] mt-4 uppercase">
            Join 500+ active profiles with tailored biomechanics programs
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserPrograms;

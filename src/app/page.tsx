"use client";

import React, { useEffect, useRef, useState } from "react";
import TerminalOverlay from "@/components/TerminalOverlay";
import { Button } from "@/components/ui/button";
import UserPrograms from "@/components/UserPrograms";
import FeatureShowcase from "@/components/FeatureShowcase";
import ParticleCanvas from "@/components/ParticleCanvas";
import AnimatedCube from "@/components/AnimatedCube";
import { ArrowRightIcon, BrainCircuit, Activity } from "lucide-react";
import Link from "next/link";
import { playButtonHover } from "@/lib/audio";

// Helper for Animated Counter
const Counter = ({ target, duration }: { target: number; duration: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{count}</span>;
};

// Custom Typewriter Effect
const Typewriter = ({ words }: { words: string[] }) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    const handleType = () => {
      if (!isDeleting) {
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) {
          setIsDeleting(true);
          setTypingSpeed(1500); // Pause at end of word
        } else {
          setTypingSpeed(100 + Math.random() * 50);
        }
      } else {
        setText(currentWord.substring(0, text.length - 1));
        if (text === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(300); // Pause before starting next word
        } else {
          setTypingSpeed(50);
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, typingSpeed, words]);

  return <span className="text-primary border-r-2 border-primary animate-pulse">{text}</span>;
};

const HomePage = () => {
  const handleHover = () => {
    playButtonHover();
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground relative overflow-hidden font-mono">
      {/* Interactive Particle Background Layer */}
      <ParticleCanvas />

      {/* Hero Section */}
      <section className="relative z-10 py-16 md:py-24 flex-grow container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          {/* Decorative Corner Borders */}
          <div className="absolute -top-10 left-0 w-24 h-24 border-l-2 border-t-2 border-primary/20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-primary/20 pointer-events-none" />

          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 relative">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/70 block">
              SYSTEM LEVEL INITIALIZED // ENGINE v1.02
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none uppercase">
              Transform Your Body With{" "}
              <div className="h-16 flex items-center">
                <Typewriter words={["Advanced AI", "Custom Workouts", "Gamified Badges", "Local Syncing"]} />
              </div>
            </h1>

            {/* Separator Accent */}
            <div className="h-[2px] w-48 bg-gradient-to-r from-primary via-cyber-violet to-transparent opacity-60 rounded" />

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-md">
              Unlock the next level of your fitness journey. Converse with our AI assistant, seed custom training logs, earn rank achievements, and hit macros with zero external APIs needed.
            </p>

            {/* Animated Counters Grid */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/20 max-w-lg font-mono">
              <div className="flex flex-col gap-1">
                <div className="text-xl md:text-2xl text-primary font-black">
                  <Counter target={500} duration={2000} />+
                </div>
                <div className="text-[8px] uppercase tracking-wider text-muted-foreground">ACTIVE USERS</div>
              </div>
              <div className="flex flex-col gap-1 border-x border-border/10 px-4">
                <div className="text-xl md:text-2xl text-cyber-violet font-black">
                  <Counter target={15} duration={1500} />
                </div>
                <div className="text-[8px] uppercase tracking-wider text-muted-foreground">TROPHIES</div>
              </div>
              <div className="flex flex-col gap-1 pl-4">
                <div className="text-xl md:text-2xl text-cyber-lime font-black">
                  100%
                </div>
                <div className="text-[8px] uppercase tracking-wider text-muted-foreground">OFF-GRID LOCAL</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                asChild
                onMouseEnter={handleHover}
                className="overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5 text-xs font-bold uppercase tracking-wider"
              >
                <Link href="/generate-program" className="flex items-center font-mono">
                  Build Your Program
                  <ArrowRightIcon className="ml-2 w-4 h-4 animate-float" />
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                asChild
                onMouseEnter={handleHover}
                className="border-border/60 text-foreground hover:bg-white/5 px-6 py-5 text-xs font-bold uppercase tracking-wider"
              >
                <Link href="/exercises">
                  Browse Exercises
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Hero Content: 3D Cube + Holographic Ring */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyber-violet/5 rounded-full blur-3xl pointer-events-none z-0" />
            
            {/* Visual orbiting pills and lines */}
            <div className="absolute border border-primary/20 rounded-full w-72 h-72 animate-slow-spin pointer-events-none z-0">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_var(--cyber-blue-bright)]" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyber-violet rounded-full shadow-[0_0_10px_var(--cyber-violet)]" />
            </div>

            {/* Orbiting stat badges */}
            <div className="absolute top-10 left-10 bg-cyber-black/70 border border-primary/40 rounded px-2.5 py-1 text-[9px] font-bold text-primary flex items-center gap-1.5 shadow-lg pointer-events-none animate-float">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI COACH</span>
            </div>
            
            <div className="absolute bottom-10 right-10 bg-cyber-black/70 border border-cyber-violet/40 rounded px-2.5 py-1 text-[9px] font-bold text-cyber-violet flex items-center gap-1.5 shadow-lg pointer-events-none animate-float" style={{ animationDelay: "-2s" }}>
              <Activity className="w-3.5 h-3.5" />
              <span>ACTIVE TRACKER</span>
            </div>

            {/* Rotating 3D Cube */}
            <div className="relative z-10">
              <AnimatedCube />
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <FeatureShowcase />

      {/* Terminal Preview Block */}
      <section className="py-12 md:py-16 bg-cyber-black/40 border-y border-border/20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">System Console</h3>
            <p className="text-sm font-bold text-foreground font-mono">Simulate Assistant Diagnostics</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <TerminalOverlay />
          </div>
        </div>
      </section>

      {/* Bottom Programs/Workouts Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <UserPrograms />
        </div>
      </section>
    </div>
  );
};

export default HomePage;

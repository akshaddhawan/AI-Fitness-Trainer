"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrainCircuit, Mic, Sparkles, Flame, Apple, Trophy } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color, delay }) => {
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

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-xl p-6 transition-all duration-700 card-3d group border relative overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ 
        transitionDelay: `${delay}ms`,
        borderColor: `${color}20`,
      }}
    >
      {/* Glow background on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`
        }}
      />
      
      {/* Accent corner lines */}
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t" style={{ borderColor: `${color}30` }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b" style={{ borderColor: `${color}30` }} />

      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center border mb-4 shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{
          borderColor: `${color}30`,
          backgroundColor: `${color}08`,
          color: color,
          boxShadow: `0 0 15px ${color}15`
        }}
      >
        {icon}
      </div>

      <h3 className="font-bold text-foreground text-sm tracking-wide mb-2 uppercase font-mono group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed font-mono">
        {description}
      </p>
    </div>
  );
};

const FeatureShowcase = () => {
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI Fitness Coach",
      description: "Get hyper-personalized workout programs and diet plans generated instantly based on your biometrics.",
      color: "var(--cyber-blue-bright)",
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Interactive Voice",
      description: "Speak directly with your AI coach during workouts. Log sets, start rest timers, and get guidance hands-free.",
      color: "var(--cyber-violet)",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Dual-Mode System",
      description: "Log in with Clerk and Convex Cloud, or use the fully functional off-grid Local Mode directly inside your browser.",
      color: "var(--cyber-lime)",
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: "Active Tracker",
      description: "Start real-time workout sessions with exercise checklist flows and automated stopwatch countdowns.",
      color: "var(--cyber-orange)",
    },
    {
      icon: <Apple className="w-6 h-6" />,
      title: "Habit Database",
      description: "Keep track of your daily water intake with visual fluid animations and log your macros against diet goals.",
      color: "var(--cyber-gold)",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Gamification",
      description: "Earn experience points (XP), level up your rank, maintain active streaks, and unlock 15+ special badges.",
      color: "var(--cyber-magenta)",
    },
  ];

  return (
    <section className="py-16 md:py-24 container mx-auto px-4 max-w-6xl relative z-10">
      <div className="text-center mb-12">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/70 block mb-3">
          SYSTEM CORE
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase font-mono">
          Engineered for <span className="text-primary neon-text">Peak Performance</span>
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <FeatureCard
            key={idx}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            delay={idx * 100}
          />
        ))}
      </div>
    </section>
  );
};

export default FeatureShowcase;

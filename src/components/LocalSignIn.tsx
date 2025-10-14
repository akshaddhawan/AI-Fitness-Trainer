"use client";

import React, { useState } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import CornerElements from "./CornerElements";
import { Zap, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

const DEMO_PRESETS = [
  {
    name: "Alex Trainer (Default)",
    email: "alex.trainer@codeflex.ai",
    password: "password123",
    role: "AI Fitness Coach",
  },
  {
    name: "Sarah Shred",
    email: "sarah.shred@example.com",
    password: "password123",
    role: "Active Member",
  },
  {
    name: "Michael Muscle",
    email: "michael.muscle@example.com",
    password: "password123",
    role: "Active Member",
  },
];

const LocalSignIn = () => {
  const { login } = useAppServices();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (preset: typeof DEMO_PRESETS[0]) => {
    setError("");
    setLoading(true);
    try {
      const res = await login(preset.email, preset.password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Preset login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 font-mono">
      <Card className="relative bg-card/90 backdrop-blur-sm border border-border shadow-[0_0_20px_rgba(24,206,242,0.1)]">
        <CornerElements />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto p-2 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 border border-primary/20">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-wider">
            SYSTEM.<span className="text-primary">LOGIN</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            ACCESS SECURE FITNESS DATABASE
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground tracking-wider block">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-cyber-terminal-bg border border-border rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground tracking-wider block">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cyber-terminal-bg border border-border rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-sm py-3 mt-4"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN & ACCESS"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <span className="relative bg-card px-2 text-[10px] text-muted-foreground uppercase">OR BYPASS AUTH</span>
          </div>
          
          {/* QUICK DEMO PRESETS */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-muted-foreground tracking-wider block text-center mb-3">
              QUICK ACCESS PRESETS
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickLogin(preset)}
                  disabled={loading}
                  className="flex items-center justify-between p-2.5 bg-cyber-terminal-bg/40 border border-border/40 hover:border-primary/40 rounded transition-all duration-300 text-left group cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{preset.email}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 text-[8px] text-primary">
                    <ShieldCheck size={10} />
                    <span>{preset.role.toUpperCase()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="justify-center pb-8 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline font-bold">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LocalSignIn;

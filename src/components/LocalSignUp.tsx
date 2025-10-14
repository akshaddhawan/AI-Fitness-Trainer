"use client";

import React, { useState } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import CornerElements from "./CornerElements";
import { Zap, AlertTriangle, ArrowRight, Check } from "lucide-react";

const AVATAR_OPTIONS = [
  { url: "https://randomuser.me/api/portraits/men/32.jpg", label: "Coach 01" },
  { url: "https://randomuser.me/api/portraits/women/44.jpg", label: "Coach 02" },
  { url: "https://randomuser.me/api/portraits/men/86.jpg", label: "Coach 03" },
  { url: "https://randomuser.me/api/portraits/women/68.jpg", label: "Coach 04" },
  { url: "https://randomuser.me/api/portraits/women/12.jpg", label: "Athlete 01" },
  { url: "https://randomuser.me/api/portraits/men/43.jpg", label: "Athlete 02" },
];

const LocalSignUp = () => {
  const { register } = useAppServices();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    try {
      const res = await register(name, email, password, selectedAvatar);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Registration failed");
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
            SYSTEM.<span className="text-primary">REGISTER</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            CREATE SECURE CODFLEX IDENTIFICATION
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
              <label className="text-[10px] uppercase text-muted-foreground tracking-wider block">FULL NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-cyber-terminal-bg border border-border rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>

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
                placeholder="min 6 chars"
                className="w-full bg-cyber-terminal-bg border border-border rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground tracking-wider block">CONFIRM PASSWORD</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="re-enter password"
                className="w-full bg-cyber-terminal-bg border border-border rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>

            {/* AVATAR SELECTOR */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] uppercase text-muted-foreground tracking-wider block">SELECT AVATAR PROFILE</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(option.url)}
                    className={`relative aspect-square rounded overflow-hidden border transition-all duration-300 cursor-pointer ${
                      selectedAvatar === option.url
                        ? "border-primary shadow-[0_0_8px_rgba(24,206,242,0.4)]"
                        : "border-border/40 hover:border-primary/30"
                    }`}
                  >
                    <img src={option.url} alt={option.label} className="w-full h-full object-cover" />
                    {selectedAvatar === option.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-sm py-3 mt-4"
            >
              {loading ? "CREATING PROFILE..." : "SIGN UP & INITIALIZE"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center pb-8 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-bold">
              Sign In here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LocalSignUp;

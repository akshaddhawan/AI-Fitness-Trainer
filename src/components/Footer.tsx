"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ZapIcon, Github, Twitter, Linkedin, ArrowUp, Send } from "lucide-react";
import { playButtonHover } from "@/lib/audio";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem("codeflex_newsletter_subscribed", email);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-cyber-black border-t border-border/60 pt-16 pb-8 font-mono text-[11px] text-muted-foreground z-10 overflow-hidden">
      
      {/* Wave/Grid Ambient Divider at Top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/30 via-cyber-violet/30 to-cyber-magenta/30" />
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/5 to-transparent opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Column 1: Branding */}
        <div className="md:col-span-5 space-y-4">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 font-black text-sm tracking-widest text-foreground hover:text-primary transition-all duration-300"
            onClick={playButtonHover}
          >
            <ZapIcon className="text-primary fill-primary" size={14} />
            <span>CODEFLEX<span className="text-primary">.AI</span></span>
          </Link>
          
          <p className="leading-relaxed max-w-sm">
            Empowering athletes with hyper-personalized workout scheduling, nutrition logging, biometrics analytics, and AI coach interactions. Fully serverless or local.
          </p>

          {/* Socials */}
          <div className="flex gap-3 pt-2">
            {[
              { icon: <Github size={14} />, href: "https://github.com" },
              { icon: <Twitter size={14} />, href: "https://twitter.com" },
              { icon: <Linkedin size={14} />, href: "https://linkedin.com" },
            ].map((soc, idx) => (
              <a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playButtonHover}
                className="w-7 h-7 rounded border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_8px_rgba(24,206,242,0.15)] transition-all duration-300"
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-widest border-l-2 border-primary pl-2">
            System Index
          </h4>
          <ul className="space-y-2.5">
            {[
              { href: "/", label: "Home Base" },
              { href: "/exercises", label: "Exercise Library" },
              { href: "/bmi-calculator", label: "BMI Engine" },
              { href: "/achievements", label: "Trophy Room" },
              { href: "/coach-chat", label: "Coach Chat" },
              { href: "/routines", label: "Routine Builder" },
              { href: "/challenges", label: "Cyber Quests" },
              { href: "/nutrition", label: "Fuel Sync" },
              { href: "/arena", label: "Cyber Arena" },
              { href: "/generate-program", label: "AI Coach" },
              { href: "/profile", label: "User Dashboard" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={playButtonHover}
                  className="hover:text-primary hover:underline transition-colors duration-200 block"
                >
                  {"// " + link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Newsletter */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-widest border-l-2 border-primary pl-2">
            Newsletter Sync
          </h4>
          <p className="leading-relaxed">
            Subscribe to get raw intelligence reports, training strategies, and updates directly.
          </p>

          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="ENTER EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-cyber-dark border border-border/60 rounded px-3 py-2 text-[10px] focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/30 font-mono"
            />
            <button
              type="submit"
              onClick={playButtonHover}
              className="px-3 rounded border border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_10px_rgba(24,206,242,0.25)] transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              <Send size={12} />
            </button>
          </form>

          {subscribed && (
            <p className="text-[10px] text-primary animate-pulse font-bold">
              SYSTEM CONNECTED: SUBSCRIPTION SYNC COMPLETED.
            </p>
          )}
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span>&copy; {new Date().getFullYear()} CODEFLEX.AI. ALL PRIVILEGES RESERVED.</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[9px] uppercase text-primary/70 tracking-widest animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            SECURE LINK ACTIVE
          </span>
          
          <button
            onClick={() => {
              scrollToTop();
              playButtonHover();
            }}
            className="flex items-center gap-1 text-[10px] text-primary hover:text-foreground hover:underline transition-colors font-bold uppercase cursor-pointer"
          >
            SCROLL TO APEX
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

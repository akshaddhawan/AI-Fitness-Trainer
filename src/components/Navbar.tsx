"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { 
  DumbbellIcon, HomeIcon, UserIcon, ZapIcon, LogOut, LayoutDashboard, 
  Menu, X, BookOpen, Calculator, Trophy, Bell, MessageSquare, PlusSquare, Target,
  Swords, Flame 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useAppServices } from "@/providers/AppServicesProvider";
import { playButtonHover } from "@/lib/audio";

const Navbar = () => {
  const pathname = usePathname();
  const { isCloudActive, isSignedIn, user, logout, achievements } = useAppServices();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHover = () => {
    playButtonHover();
  };

  // Nav Links configuration
  const navLinks = useMemo(() => [
    { href: "/", label: "Home", icon: <HomeIcon size={14} /> },
    { href: "/exercises", label: "Exercises", icon: <BookOpen size={14} /> },
    { href: "/bmi-calculator", label: "BMI", icon: <Calculator size={14} /> },
    { href: "/achievements", label: "Trophies", icon: <Trophy size={14} /> },
    { href: "/coach-chat", label: "AI Chat", icon: <MessageSquare size={14} /> },
    { href: "/routines", label: "Builder", icon: <PlusSquare size={14} /> },
    { href: "/challenges", label: "Quests", icon: <Target size={14} /> },
    { href: "/nutrition", label: "Fuel Sync", icon: <Flame size={14} /> },
    { href: "/arena", label: "Arena", icon: <Swords size={14} /> },
    { href: "/generate-program", label: "Coach", icon: <DumbbellIcon size={14} /> },
    { href: "/profile", label: "Dashboard", icon: <UserIcon size={14} /> },
  ], []);

  // Compute number of achievements
  const achievementsCount = useMemo(() => {
    if (!achievements) return 0;
    return Object.keys(achievements).length;
  }, [achievements]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border/80 py-2.5 px-4 font-mono">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 font-black text-sm tracking-widest text-foreground hover:text-primary transition-all duration-300"
          onMouseEnter={handleHover}
        >
          <ZapIcon className="text-primary fill-primary animate-pulse" size={16} />
          <span>CODEFLEX<span className="text-primary">.AI</span></span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={handleHover}
                className={`flex items-center gap-1 py-1.5 text-[11px] font-bold uppercase tracking-wider relative transition-colors duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {/* Active Indicator Underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary shadow-[0_0_8px_var(--cyber-blue-bright)] rounded" />
                )}
                {/* Special Notification Badge for achievements link */}
                {link.href === "/achievements" && achievementsCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary items-center justify-center text-[7px] font-black text-black">
                      {achievementsCount}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AUTHENTICATION & PORTAL ACTIONS */}
        <div className="flex items-center gap-3">
          
          {/* Active Achievements bell */}
          {isSignedIn && (
            <Link 
              href="/achievements" 
              className="relative p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              onMouseEnter={handleHover}
            >
              <Bell size={14} className={achievementsCount > 0 ? "animate-bounce" : ""} />
              {achievementsCount > 0 && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </Link>
          )}

          {isSignedIn ? (
            <>
              {isCloudActive ? (
                <UserButton />
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onMouseEnter={handleHover}
                    className="flex items-center focus:outline-none cursor-pointer"
                  >
                    {user?.imageUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/40 hover:border-primary hover:shadow-[0_0_10px_rgba(24,206,242,0.3)] transition-all duration-300">
                        <img src={user.imageUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border border-primary/40 text-primary font-bold text-xs">
                        {user?.firstName?.charAt(0) || "U"}
                      </div>
                    )}
                  </button>

                  {/* CUSTOM CYBER DROPDOWN */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-cyber-terminal-bg backdrop-blur-md border border-border/80 shadow-[0_4px_25px_rgba(24,206,242,0.15)] rounded-lg py-2 z-50 animate-fadeIn font-mono text-[10px] uppercase">
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/40" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />

                      <div className="px-4 py-2 border-b border-border/50">
                        <p className="font-bold text-foreground text-[11px] truncate">{user?.fullName}</p>
                        <p className="text-[9px] text-muted-foreground/60 truncate mt-0.5 lowercase">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors w-full text-left"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Profile Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {isCloudActive ? (
                <div className="hidden sm:flex items-center gap-2">
                  <SignInButton>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/50 text-primary hover:text-white hover:bg-primary/10 text-[10px] tracking-wider font-bold"
                    >
                      SIGN IN
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button 
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] tracking-wider font-bold"
                    >
                      SIGN UP
                    </Button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-primary/50 text-primary hover:text-white hover:bg-primary/10 text-[10px] tracking-wider font-bold"
                  >
                    <Link href="/sign-in">SIGN IN</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] tracking-wider font-bold"
                  >
                    <Link href="/sign-up">SIGN UP</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* MOBILE MENU TRIGGER */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={handleHover}
            className="md:hidden p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 bottom-0 bg-cyber-dark/95 backdrop-blur-md border-t border-border/40 z-40 p-6 flex flex-col justify-between animate-fadeIn">
          <div className="flex flex-col gap-4">
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] border-b border-border/10 pb-2">
              Navigation Menu
            </span>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-bold uppercase transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(24,206,242,0.1)]" 
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {!isSignedIn && (
            <div className="flex flex-col gap-2 pt-6 border-t border-border/10">
              <Button
                asChild
                variant="outline"
                className="w-full border-primary/50 text-primary hover:text-white hover:bg-primary/10 font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/sign-in">SIGN IN</Link>
              </Button>
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/sign-up">SIGN UP</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppServices } from "@/providers/AppServicesProvider";
import CornerElements from "@/components/CornerElements";
import { playSuccessSound, playAchievementUnlock, playButtonHover } from "@/lib/audio";
import { Swords, Zap, Terminal, Plus } from "lucide-react";

interface Boss {
  id: string;
  name: string;
  tier: string;
  maxHp: number;
  attackPower: number;
  defense: number;
  xpReward: number;
  minLevel: number;
  avatar: string;
}

const BOSSES_DATABASE: Boss[] = [
  { id: "boss_beast_byte", name: "Beast-Byte v1.0", tier: "Bronze", maxHp: 1500, attackPower: 80, defense: 10, xpReward: 200, minLevel: 1, avatar: "🤖" },
  { id: "boss_crimson_titan", name: "Crimson-Titan v2.5", tier: "Gold", maxHp: 5000, attackPower: 220, defense: 45, xpReward: 500, minLevel: 3, avatar: "👹" },
  { id: "boss_omega_centurion", name: "Omega-Centurion v9.0", tier: "Legendary", maxHp: 12000, attackPower: 480, defense: 110, xpReward: 1200, minLevel: 5, avatar: "🔮" },
];

const CyberArena = () => {
  const { stats, addXp, logWater, logCalories, completeWorkoutSession } = useAppServices();
  const [selectedBossIdx, setSelectedBossIdx] = useState(0);
  const [gameState, setGameState] = useState<"lobby" | "battle" | "victory" | "defeat">("lobby");
  
  // Combat stats
  const [playerHp, setPlayerHp] = useState(1000);
  const [playerMaxHp, setPlayerMaxHp] = useState(1000);
  const [bossHp, setBossHp] = useState(1500);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  // Animation damage text
  const floatingTextsRef = useRef<Array<{ id: number; text: string; x: number; y: number; color: string; alpha: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleHover = () => {
    playButtonHover();
  };

  const currentBoss = BOSSES_DATABASE[selectedBossIdx];

  // Load defeated bosses from localStorage
  useEffect(() => {
    if (stats?.lastActiveDate) {
      const key = `codeflex_defeated_bosses_${stats.lastActiveDate.replace(/\//g, "_")}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setDefeatedBosses(JSON.parse(stored));
      }
    }
  }, [stats]);

  // Calculate Combat Action Points (CAP) based on logged stats
  const combatActionPoints = useMemo(() => {
    if (!stats) return 20; // Base CAP

    const waterCap = Math.floor(stats.dailyWater / 100); // +1 CAP per 100ml
    const workoutCap = stats.workoutsCompleted * 50; // +50 CAP per workout
    const calorieCap = Math.floor(stats.dailyCaloriesLogged / 100) * 2; // +2 CAP per 100kcal
    const levelCap = stats.level * 5;

    return 20 + waterCap + workoutCap + calorieCap + levelCap;
  }, [stats]);

  // Start battle
  const startBattle = () => {
    if (!stats) return;
    if (stats.level < currentBoss.minLevel) {
      alert(`Required power level: Level ${currentBoss.minLevel}`);
      return;
    }

    const initialPlayerHp = 1000 + stats.level * 100;
    setPlayerHp(initialPlayerHp);
    setPlayerMaxHp(initialPlayerHp);
    setBossHp(currentBoss.maxHp);
    setGameState("battle");
    setBattleLogs([
      `[SYS] BATTLE INITIALIZED: PLAYER VS ${currentBoss.name.toUpperCase()}`,
      `[SYS] COMBAT SHIELD DEPLOYED. EXECUTE TACTICAL MANEUVERS.`,
    ]);
    playSuccessSound();
  };

  // Add float text helper
  const addFloatingText = (text: string, isPlayerSide: boolean, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      text,
      x: isPlayerSide ? 70 : 180,
      y: 120,
      color,
      alpha: 1,
    });
  };


  // Let's introduce currentSessionCap state to track energy spent in battle
  const [sessionCap, setSessionCap] = useState(20);

  useEffect(() => {
    if (gameState === "lobby") {
      setSessionCap(combatActionPoints);
    }
  }, [gameState, combatActionPoints]);

  const handleExecuteMove = (moveName: string, capCost: number, damageMin: number, damageMax: number, healAmount = 0) => {
    if (gameState !== "battle") return;
    if (sessionCap < capCost) {
      setBattleLogs((prev) => [
        `[WARN] CAP CHASSIS UNDERCHARGE: NEED ${capCost} CAP.`,
        ...prev.slice(0, 5),
      ]);
      return;
    }

    // Deduct CAP
    setSessionCap((prev) => prev - capCost);
    playButtonHover();

    // 1. Player Turn
    let finalLog = "";
    if (healAmount > 0) {
      const healed = Math.min(healAmount, playerMaxHp - playerHp);
      setPlayerHp((prev) => Math.min(playerMaxHp, prev + healed));
      addFloatingText(`+${healed} HP`, true, "#ec4899");
      finalLog = `[PLAYER] CAST ${moveName.toUpperCase()}: RESTORED ${healed} HP MATRIX.`;
    } else {
      // Calculate damage with boss defense mitigation
      const rawDamage = Math.floor(Math.random() * (damageMax - damageMin + 1)) + damageMin;
      const finalDamage = Math.max(50, rawDamage - currentBoss.defense);
      setBossHp((prev) => Math.max(0, prev - finalDamage));
      addFloatingText(`-${finalDamage}`, false, "#18cef2");
      finalLog = `[PLAYER] CAST ${moveName.toUpperCase()}: INFLICTED ${finalDamage} DMG TO ${currentBoss.name.toUpperCase()}.`;
      
      // Flash screen shake on hit
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 200);
    }

    setBattleLogs((prev) => [finalLog, ...prev.slice(0, 5)]);

    // Check if Boss is Defeated
    const nextBossHp = healAmount > 0 ? bossHp : Math.max(0, bossHp - (Math.max(50, (Math.floor(Math.random() * (damageMax - damageMin + 1)) + damageMin) - currentBoss.defense)));
    
    if (nextBossHp <= 0) {
      setTimeout(() => {
        handleVictory();
      }, 1000);
      return;
    }

    // 2. Boss Turn (delayed by 800ms)
    setTimeout(() => {
      if (gameState !== "battle") return;
      const rawBossDmg = Math.floor(Math.random() * currentBoss.attackPower) + 50;
      const playerDefMitigation = Math.floor(stats!.level * 10);
      const finalBossDmg = Math.max(50, rawBossDmg - playerDefMitigation);

      setPlayerHp((prev) => {
        const nextHp = Math.max(0, prev - finalBossDmg);
        if (nextHp <= 0) {
          setTimeout(() => {
            setGameState("defeat");
            setBattleLogs((prevL) => [`[ALERT] FATAL ERROR: HP MATRIX CRITICAL. BATTLE DEFEATED.`, ...prevL.slice(0, 5)]);
          }, 800);
        }
        return nextHp;
      });

      addFloatingText(`-${finalBossDmg} HP`, true, "#ef4444");
      setBattleLogs((prev) => [
        `[BOSS] ${currentBoss.name.toUpperCase()} ATTACKED: DEALT ${finalBossDmg} DMG TO PLAYER.`,
        ...prev.slice(0, 5),
      ]);
    }, 800);
  };

  const handleVictory = () => {
    setGameState("victory");
    playAchievementUnlock();
    addXp(currentBoss.xpReward);
    
    // Save to defeated list
    const updated = [...defeatedBosses];
    if (!updated.includes(currentBoss.id)) {
      updated.push(currentBoss.id);
      setDefeatedBosses(updated);
      if (stats?.lastActiveDate) {
        const key = `codeflex_defeated_bosses_${stats.lastActiveDate.replace(/\//g, "_")}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }

    setBattleLogs((prev) => [
      `[SYS] SECURED VICTORY PROTOCOL against ${currentBoss.name.toUpperCase()}!`,
      `[SYS] XP REWARD DISPATCHED: +${currentBoss.xpReward} XP.`,
      ...prev.slice(0, 5),
    ]);
  };

  // Direct physical telemetry injection to boost CAP in real-time
  const injectWaterBoost = () => {
    logWater(500);
    setSessionCap((prev) => prev + 5);
    setSynthLogLocal("[SYS] FLUID FUEL MATRIX SYNCED (+5 CAP)");
  };

  const injectCalorieBoost = () => {
    logCalories(300);
    setSessionCap((prev) => prev + 6);
    setSynthLogLocal("[SYS] INGESTION METRICS SYNCED (+6 CAP)");
  };

  const injectWorkoutBoost = () => {
    completeWorkoutSession();
    setSessionCap((prev) => prev + 50);
    setSynthLogLocal("[SYS] PHYSICAL WORKOUT SYNCED (+50 CAP)");
  };

  const setSynthLogLocal = (text: string) => {
    setBattleLogs((prev) => [text, ...prev.slice(0, 5)]);
    playSuccessSound();
  };

  // Canvas Arena Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      tick += 0.05;

      // Draw scanline/grid grid backdrop
      ctx.strokeStyle = "rgba(24, 206, 242, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // Draw avatars
      ctx.font = "3.2rem Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Player Avatar (Left side)
      const pBob = gameState === "battle" ? Math.sin(tick) * 5 : 0;
      ctx.fillText("🏋️", 70, 130 + pBob);

      // Boss Avatar (Right side)
      const bBob = gameState === "battle" ? Math.cos(tick * 1.2) * 6 : 0;
      ctx.fillText(currentBoss.avatar, w - 70, 130 + bBob);

      // Render Floating Text
      floatingTextsRef.current = floatingTextsRef.current.filter((p) => {
        p.y -= 1.2;
        p.alpha -= 0.015;
        if (p.alpha > 0) {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.font = "bold 10px monospace";
          ctx.globalAlpha = p.alpha;
          ctx.fillText(p.text, p.x, p.y);
          ctx.restore();
          return true;
        }
        return false;
      });

      // Combat spark effects on canvas
      if (gameState === "battle" && Math.random() < 0.2) {
        ctx.strokeStyle = "rgba(24, 206, 242, 0.4)";
        ctx.beginPath();
        ctx.moveTo(w / 2 - 30 + Math.random() * 60, h / 2 - 20 + Math.random() * 40);
        ctx.lineTo(w / 2 - 30 + Math.random() * 60, h / 2 - 20 + Math.random() * 40);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, currentBoss]);

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-6xl animate-page-enter font-mono text-xs">
      
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 block mb-2">
          PVP TERMINAL // SECURE SECTOR
        </span>
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight flex items-center justify-center gap-2">
          <Swords className="text-primary w-8 h-8" />
          Cyber <span className="text-primary neon-text">Arena</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Section: Lobby or Battle Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {gameState === "lobby" ? (
            <div className="glass-card rounded-xl p-6 relative flex-1 flex flex-col justify-between min-h-[460px]">
              <CornerElements />
              <div>
                <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">
                  Arena Security Console // Select Opponent
                </h3>

                <div className="space-y-4">
                  {BOSSES_DATABASE.map((boss, idx) => {
                    const isUnlocked = stats ? stats.level >= boss.minLevel : true;
                    const isDefeated = defeatedBosses.includes(boss.id);

                    return (
                      <div
                        key={boss.id}
                        onClick={() => isUnlocked && setSelectedBossIdx(idx)}
                        className={`p-4 rounded-lg border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                          selectedBossIdx === idx
                            ? "bg-primary/10 border-primary shadow-[0_0_12px_rgba(24,206,242,0.15)]"
                            : isUnlocked
                            ? "bg-cyber-black/40 border-border/40 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                            : "bg-cyber-black/20 border-border/10 text-muted-foreground/30 pointer-events-none"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{boss.avatar}</span>
                          <div>
                            <h4 className="font-bold text-foreground text-xs uppercase tracking-wide flex items-center gap-1.5">
                              {boss.name}
                              {isDefeated && (
                                <span className="text-[7px] bg-cyber-lime/10 border border-cyber-lime/30 text-cyber-lime px-1.5 py-0.5 rounded font-black tracking-widest">
                                  DEFEATED
                                </span>
                              )}
                            </h4>
                            <p className="text-[8px] text-muted-foreground uppercase mt-1">
                              HP: {boss.maxHp} &bull; ATK: {boss.attackPower} &bull; DEF: {boss.defense}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
                            +{boss.xpReward} XP BOUNTY
                          </span>
                          {!isUnlocked && (
                            <p className="text-[7px] text-destructive uppercase font-bold mt-1">Requires Level {boss.minLevel}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={startBattle}
                onMouseEnter={handleHover}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold uppercase tracking-widest py-3 mt-6 flex items-center justify-center gap-1.5 rounded-lg shadow-[0_0_12px_rgba(24,206,242,0.25)] cursor-pointer"
              >
                <Zap size={14} />
                ENGAGE BATTLE ENCOUNTER
              </button>
            </div>
          ) : (
            // Active Battle Console
            <div className={`glass-card rounded-xl p-5 relative flex-1 flex flex-col justify-between min-h-[460px] overflow-hidden transition-transform ${
              screenShake ? "scale-[0.99] translate-x-1" : ""
            }`}>
              <CornerElements />

              {/* Combat Screen Canvas */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] font-bold text-primary tracking-widest uppercase">SYS_LOG: BATTLE_GRID_FEED</span>
                  <div className="flex items-center gap-1 text-[8px] font-bold text-cyber-violet">
                    <Zap className="w-3.5 h-3.5 fill-cyber-violet animate-pulse" />
                    <span>CAP ENERGY: {sessionCap} CAP</span>
                  </div>
                </div>

                <div className="relative w-full aspect-[2/1] bg-cyber-black/70 rounded-lg overflow-hidden border border-border/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] mb-4">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={250}
                    className="w-full h-full block"
                  />

                  {/* HP overlays */}
                  <div className="absolute top-3 left-3 w-40 space-y-1 bg-cyber-black/80 p-2 rounded border border-border/20">
                    <div className="flex justify-between text-[7px] font-bold text-foreground">
                      <span>ATHLETE CHASSIS</span>
                      <span>{playerHp} / {playerMaxHp}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                      <div className="bg-cyber-lime h-full rounded-full transition-all duration-300" style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} />
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 w-40 space-y-1 bg-cyber-black/80 p-2 rounded border border-border/20">
                    <div className="flex justify-between text-[7px] font-bold text-foreground">
                      <span>{currentBoss.name.toUpperCase()}</span>
                      <span>{bossHp} / {currentBoss.maxHp}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                      <div className="bg-destructive h-full rounded-full transition-all duration-300" style={{ width: `${(bossHp / currentBoss.maxHp) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action grid (Moves) */}
              {gameState === "battle" && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => handleExecuteMove("Cardio Strike", 10, 200, 400)}
                    onMouseEnter={handleHover}
                    className="p-3 bg-cyber-black/60 hover:bg-primary/10 border border-primary/40 hover:border-primary text-foreground hover:text-primary rounded-lg text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[70px]"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold uppercase text-[9px]">Cardio Strike</span>
                      <span className="text-[7px] font-bold text-primary">10 CAP</span>
                    </div>
                    <p className="text-[7px] text-muted-foreground uppercase leading-normal">High-frequency kinetic punch. Deals 200-400 DMG.</p>
                  </button>

                  <button
                    onClick={() => handleExecuteMove("Protein Surge", 20, 0, 0, 300)}
                    onMouseEnter={handleHover}
                    className="p-3 bg-cyber-black/60 hover:bg-cyber-magenta/10 border border-cyber-magenta/40 hover:border-cyber-magenta text-foreground hover:text-cyber-magenta rounded-lg text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[70px]"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold uppercase text-[9px]">Protein Cell Repair</span>
                      <span className="text-[7px] font-bold text-cyber-magenta">20 CAP</span>
                    </div>
                    <p className="text-[7px] text-muted-foreground uppercase leading-normal">Restores 300 HP using synthesis amino cores.</p>
                  </button>

                  <button
                    onClick={() => handleExecuteMove("Laser Deadlift", 40, 800, 1200)}
                    onMouseEnter={handleHover}
                    className="p-3 bg-cyber-black/60 hover:bg-cyber-gold/10 border border-cyber-gold/40 hover:border-cyber-gold text-foreground hover:text-cyber-gold rounded-lg text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[70px]"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold uppercase text-[9px]">Laser Deadlift</span>
                      <span className="text-[7px] font-bold text-cyber-gold">40 CAP</span>
                    </div>
                    <p className="text-[7px] text-muted-foreground uppercase leading-normal">Heavy-gravity blast. Deals 800-1200 DMG.</p>
                  </button>

                  <button
                    onClick={() => handleExecuteMove("Synth Beam", 60, 1800, 2500)}
                    onMouseEnter={handleHover}
                    className="p-3 bg-cyber-black/60 hover:bg-cyber-lime/10 border border-cyber-lime/40 hover:border-cyber-lime text-foreground hover:text-cyber-lime rounded-lg text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[70px]"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold uppercase text-[9px]">Molecular Synth Beam</span>
                      <span className="text-[7px] font-bold text-cyber-lime">60 CAP</span>
                    </div>
                    <p className="text-[7px] text-muted-foreground uppercase leading-normal">Ultimate release beam. Deals 1800-2500 DMG.</p>
                  </button>
                </div>
              )}

              {/* End state screens */}
              {(gameState === "victory" || gameState === "defeat") && (
                <div className="text-center py-6 border border-dashed border-border/40 rounded-xl my-3 space-y-4">
                  <h3 className={`text-xl font-bold uppercase tracking-widest ${gameState === "victory" ? "text-cyber-lime" : "text-destructive"}`}>
                    {gameState === "victory" ? "Victory Protocol Cleared" : "Chassis Terminated"}
                  </h3>
                  <p className="text-[9px] text-muted-foreground max-w-sm mx-auto uppercase">
                    {gameState === "victory" 
                      ? `Successfully secured sector. Received +${currentBoss.xpReward} XP multiplier bounty.`
                      : "HP Core depleted. Log more telemetry stats to boost starting matrix."}
                  </p>
                  <button
                    onClick={() => setGameState("lobby")}
                    onMouseEnter={handleHover}
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-colors rounded-lg font-bold uppercase cursor-pointer"
                  >
                    DISCONNECT LOGS
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Section: Telemetry Booster Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Diagnostic CAP Telemetry logs */}
          <div className="glass-card rounded-xl p-5 relative flex-1 flex flex-col justify-between">
            <CornerElements />
            
            <div>
              <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                Live Combat log
              </h3>
              
              <div className="bg-cyber-black/90 border border-border/50 rounded-lg p-3 h-[130px] overflow-y-auto font-mono text-[8px] text-primary/80 leading-relaxed custom-scroll uppercase select-none mb-4">
                {battleLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-border/5 pb-1 mb-1 last:border-b-0 truncate">{log}</div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground border-b border-border/20 pb-1.5 mb-3">
                <span>METRIC INJECTORS</span>
                <span className="text-primary">XP POOL: {stats?.xp}</span>
              </div>
              <p className="text-[8px] text-muted-foreground/80 leading-normal uppercase mb-3 font-mono">
                Running low on CAP? Inject physical telemetry logs directly into your profile. This generates combat points on the fly.
              </p>

              <div className="space-y-2">
                <button
                  onClick={injectWaterBoost}
                  onMouseEnter={handleHover}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-cyber-black/40 hover:border-primary/50 text-[9px] font-mono transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 uppercase font-bold text-foreground">
                    <Plus size={10} className="text-primary" />
                    Hydrate: Log 500ml Water
                  </span>
                  <span className="text-[8px] text-primary font-bold">+5 CAP</span>
                </button>

                <button
                  onClick={injectCalorieBoost}
                  onMouseEnter={handleHover}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-cyber-black/40 hover:border-primary/50 text-[9px] font-mono transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 uppercase font-bold text-foreground">
                    <Plus size={10} className="text-primary" />
                    Nutrient: Log 300 kcal
                  </span>
                  <span className="text-[8px] text-primary font-bold">+6 CAP</span>
                </button>

                <button
                  onClick={injectWorkoutBoost}
                  onMouseEnter={handleHover}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-cyber-black/40 hover:border-primary/50 text-[9px] font-mono transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 uppercase font-bold text-foreground">
                    <Plus size={10} className="text-primary" />
                    Activity: Log Workout Complete
                  </span>
                  <span className="text-[8px] text-primary font-bold">+50 CAP</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CyberArena;

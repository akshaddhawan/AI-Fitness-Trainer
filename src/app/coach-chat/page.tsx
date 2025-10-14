"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Terminal, Volume2, VolumeX, Settings, Key, Eye, EyeOff, Check, Trash2 } from "lucide-react";
import CornerElements from "@/components/CornerElements";
import { useAppServices } from "@/providers/AppServicesProvider";
import { playButtonHover } from "@/lib/audio";

interface Message {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

const CoachChatPage = () => {
  const { user } = useAppServices();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "coach",
      text: "SYSTEM ONLINE. GREETINGS, ATHLETE. I AM NOVA, YOUR AI FITNESS COACH. SPEAK OR TYPE YOUR DIAGNOSTICS PROMPT.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  // API Key config states
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API Key on client side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiApiKey(localStorage.getItem("codeflex_user_gemini_key") || "");
    }
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const handleSendRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);


  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setInputText(speechToText);
          handleSendRef.current?.(speechToText);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleHover = () => {
    playButtonHover();
  };

  // Speaks coach message using Web Speech Synthesis
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel active synthesis
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a nice robotic/low-frequency male or distinct voice
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Male"));
    if (googleVoice) utterance.voice = googleVoice;
    
    utterance.pitch = 0.85; // slightly lower pitch for cyborg style
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  // Predefined intelligent answers matching keywords
  const generateResponse = (input: string): string => {
    const text = input.toLowerCase();
    
    // Core Keyword Database
    const responses: Record<string, string> = {
      "hello": `SYSTEM READY. HELLO ${user?.firstName || "ATHLETE"}. SENSORS DETECT EXCELLENT BIOMETRICS TODAY. WHAT ARE WE OPTIMIZING TODAY?`,
      "hi": `SYSTEM READY. HELLO ${user?.firstName || "ATHLETE"}. SENSORS DETECT EXCELLENT BIOMETRICS TODAY. WHAT ARE WE OPTIMIZING TODAY?`,
      "hey": `SYSTEM READY. HELLO ${user?.firstName || "ATHLETE"}. SENSORS DETECT EXCELLENT BIOMETRICS TODAY. WHAT ARE WE OPTIMIZING TODAY?`,
      "bench": "OPTIMIZATION PROTOCOL [CHEST ROW]: KEEP YOUR SHOULDER BLADES TIGHTLY RETRACTED ON THE BENCH. LOWER THE BAR TO THE STERNAL JUNCTION. SQUEEZE THE PECTORAL SYSTEM WITH CONCENTRIC INTENSITY.",
      "chest": "OPTIMIZATION PROTOCOL [CHEST ROW]: KEEP YOUR SHOULDER BLADES TIGHTLY RETRACTED ON THE BENCH. LOWER THE BAR TO THE STERNAL JUNCTION. SQUEEZE THE PECTORAL SYSTEM WITH CONCENTRIC INTENSITY.",
      "pushup": "OPTIMIZATION PROTOCOL [CHEST ROW]: KEEP YOUR SHOULDER BLADES TIGHTLY RETRACTED ON THE BENCH. LOWER THE BAR TO THE STERNAL JUNCTION. SQUEEZE THE PECTORAL SYSTEM WITH CONCENTRIC INTENSITY.",
      "squat": "OPTIMIZATION PROTOCOL [LOWER MATRIX]: BACK SQUATS DEMAND INTRA-ABDOMINAL PRESSURE. BRACE YOUR CORE, BREAK AT THE HIPS SYMMETRICALLY, AND DESCEND TO AT LEAST 90 DEGREES. FORCE CONCENTRIC LOAD THROUGH YOUR MID-FOOT.",
      "legs": "OPTIMIZATION PROTOCOL [LOWER MATRIX]: BACK SQUATS DEMAND INTRA-ABDOMINAL PRESSURE. BRACE YOUR CORE, BREAK AT THE HIPS SYMMETRICALLY, AND DESCEND TO AT LEAST 90 DEGREES. FORCE CONCENTRIC LOAD THROUGH YOUR MID-FOOT.",
      "quads": "OPTIMIZATION PROTOCOL [LOWER MATRIX]: BACK SQUATS DEMAND INTRA-ABDOMINAL PRESSURE. BRACE YOUR CORE, BREAK AT THE HIPS SYMMETRICALLY, AND DESCEND TO AT LEAST 90 DEGREES. FORCE CONCENTRIC LOAD THROUGH YOUR MID-FOOT.",
      "protein": "MACRO TELEMETRY ADVICE: TO SECURE MUSCULAR HARDENING, CONCENTRATE ON CONSUMING 1.6 TO 2.2 GRAMS OF PROTEIN PER KILOGRAM OF TARGET BODYWEIGHT. SOURCE HIGHEST QUALITY AMINOS: EGGS, CHICKEN MATRIX, AND GREEK YOGURT.",
      "diet": "MACRO TELEMETRY ADVICE: TO SECURE MUSCULAR HARDENING, CONCENTRATE ON CONSUMING 1.6 TO 2.2 GRAMS OF PROTEIN PER KILOGRAM OF TARGET BODYWEIGHT. SOURCE HIGHEST QUALITY AMINOS: EGGS, CHICKEN MATRIX, AND GREEK YOGURT.",
      "eat": "MACRO TELEMETRY ADVICE: TO SECURE MUSCULAR HARDENING, CONCENTRATE ON CONSUMING 1.6 TO 2.2 GRAMS OF PROTEIN PER KILOGRAM OF TARGET BODYWEIGHT. SOURCE HIGHEST QUALITY AMINOS: EGGS, CHICKEN MATRIX, AND GREEK YOGURT.",
      "water": "HYDRATION METRIC CRITICAL: A MINIMUM OF 3,000 ML DAILY IS ESSENTIAL TO LUBRICATE CELLULAR METABOLISM AND FACILITATE FAST ATHLETIC STRENGTH REGENERATION.",
      "hydrate": "HYDRATION METRIC CRITICAL: A MINIMUM OF 3,000 ML DAILY IS ESSENTIAL TO LUBRICATE CELLULAR METABOLISM AND FACILITATE FAST ATHLETIC STRENGTH REGENERATION.",
      "tired": "DIAGNOSIS: CENTRAL NERVOUS SYSTEM OVERLOAD DETECTED. STRATEGIZE FOR AN ACTIVE DE-LOAD DAY OR SECURE 8 HOURS OF DEEP CIRCADIAN SLEEP. RECOVERY IS WHERE PROGRESS COMES ONLINE.",
      "fatigue": "DIAGNOSIS: CENTRAL NERVOUS SYSTEM OVERLOAD DETECTED. STRATEGIZE FOR AN ACTIVE DE-LOAD DAY OR SECURE 8 HOURS OF DEEP CIRCADIAN SLEEP. RECOVERY IS WHERE PROGRESS COMES ONLINE.",
      "sore": "DIAGNOSIS: DELAYED ONSET MUSCLE SORENESS (DOMS) IS INDUCED BY MICRO-TEARS IN MUSCLE FIBERS. TRAIN UNRELATED SYNERGISTIC SEGMENTS. ACUTE JOINT PAIN DEMANDS IMMEDIATE TRAINING TERMINATION.",
      "streak": "PROGRESSION TELEMETRY: STREAKS TRIGGER DOPAMINE. DO NOT BREAK THE STREAK CHAIN. COMPLETE YOUR DAILY WATER AND WORKOUT LOGGING TO CLAIM LEVEL MULTIPLIERS.",
      "level": "PROGRESSION TELEMETRY: STREAKS TRIGGER DOPAMINE. DO NOT BREAK THE STREAK CHAIN. COMPLETE YOUR DAILY WATER AND WORKOUT LOGGING TO CLAIM LEVEL MULTIPLIERS.",
      "back": "OPTIMIZATION PROTOCOL [POSTERIOR CHAIN]: DEADLIFTS SHIFT LOAD ACROSS HIPS AND ERECTOR SPINAE. PULL-UPS FOCUS ON SCAPULAR DEPRESSION AND ADDUCTION. KEEP CONTROLLED ECCENTRICS FOR LAT HYPERTROPHY.",
      "deadlift": "OPTIMIZATION PROTOCOL [POSTERIOR CHAIN]: DEADLIFTS SHIFT LOAD ACROSS HIPS AND ERECTOR SPINAE. PULL-UPS FOCUS ON SCAPULAR DEPRESSION AND ADDUCTION. KEEP CONTROLLED ECCENTRICS FOR LAT HYPERTROPHY.",
      "pullup": "OPTIMIZATION PROTOCOL [POSTERIOR CHAIN]: DEADLIFTS SHIFT LOAD ACROSS HIPS AND ERECTOR SPINAE. PULL-UPS FOCUS ON SCAPULAR DEPRESSION AND ADDUCTION. KEEP CONTROLLED ECCENTRICS FOR LAT HYPERTROPHY.",
      "row": "OPTIMIZATION PROTOCOL [POSTERIOR CHAIN]: DEADLIFTS SHIFT LOAD ACROSS HIPS AND ERECTOR SPINAE. PULL-UPS FOCUS ON SCAPULAR DEPRESSION AND ADDUCTION. KEEP CONTROLLED ECCENTRICS FOR LAT HYPERTROPHY.",
      "shoulder": "OPTIMIZATION PROTOCOL [SCAPULAR MATRIX]: FOR OVERHEAD PRESSING, ENGAGE CORE AND GLUTEAL PROTOCOLS. AVOID ELBOW FLARE TO MINIMIZE ROTATOR CUFF IMPINGEMENT. DEPLOY SIDE LATERAL RAISES FOR LATERAL DELT EXPANSION.",
      "delt": "OPTIMIZATION PROTOCOL [SCAPULAR MATRIX]: FOR OVERHEAD PRESSING, ENGAGE CORE AND GLUTEAL PROTOCOLS. AVOID ELBOW FLARE TO MINIMIZE ROTATOR CUFF IMPINGEMENT. DEPLOY SIDE LATERAL RAISES FOR LATERAL DELT EXPANSION.",
      "arm": "OPTIMIZATION PROTOCOL [ARM SYNAPSE]: BICEPS SECURE MAXIMUM LOAD FROM ELBOW FLEXION WITH SUPINATION (E.G. INCLINE CURLS). TRICEPS MAKE UP 60% OF ARM VOLUME; CONCENTRATE ON LONG HEAD OVERHEAD EXTENSIONS.",
      "bicep": "OPTIMIZATION PROTOCOL [ARM SYNAPSE]: BICEPS SECURE MAXIMUM LOAD FROM ELBOW FLEXION WITH SUPINATION (E.G. INCLINE CURLS). TRICEPS MAKE UP 60% OF ARM VOLUME; CONCENTRATE ON LONG HEAD OVERHEAD EXTENSIONS.",
      "tricep": "OPTIMIZATION PROTOCOL [ARM SYNAPSE]: BICEPS SECURE MAXIMUM LOAD FROM ELBOW FLEXION WITH SUPINATION (E.G. INCLINE CURLS). TRICEPS MAKE UP 60% OF ARM VOLUME; CONCENTRATE ON LONG HEAD OVERHEAD EXTENSIONS.",
      "core": "OPTIMIZATION PROTOCOL [MIDSECTION BRACING]: PLANKS DEPLOY STATIC TRANSVERSE ABDOMINIS TENSION. CRUNCHES INITIATE RECTUS ABDOMINIS SEGMENTAL FLEXION. MAINTAIN ACTIVE DIAPHRAGMATIC BREATHING.",
      "abs": "OPTIMIZATION PROTOCOL [MIDSECTION BRACING]: PLANKS DEPLOY STATIC TRANSVERSE ABDOMINIS TENSION. CRUNCHES INITIATE RECTUS ABDOMINIS SEGMENTAL FLEXION. MAINTAIN ACTIVE DIAPHRAGMATIC BREATHING.",
      "creatine": "SUPPLEMENT ANALYSIS: CREATINE MONOHYDRATE INCREASES INTRAMUSCULAR PHOSPHOCREATINE STORES, ENHANCING ATP RE-SYNTHESIS. CONSUME 5G DAILY CONSISTENTLY FOR OPTIMAL STRENGTH.",
      "supplement": "SUPPLEMENT ANALYSIS: CREATINE MONOHYDRATE INCREASES INTRAMUSCULAR PHOSPHOCREATINE STORES, ENHANCING ATP RE-SYNTHESIS. CONSUME 5G DAILY CONSISTENTLY. PRE-WORKOUT CAFFEINE (150-300MG) BOOSTS MOTIVATION.",
      "calories": "THERMODYNAMIC BALANCE INTEL: TO INDUCE FAT LOSS (CUTTING), DEPLOY A MODERATE ENERGY DEFICIT OF 300-500 KCAL. TO EXPAND CELLULAR MASS (BULKING), MAINTAIN A SURPLUS OF 250-500 KCAL WITH OVERLOAD.",
      "bulk": "THERMODYNAMIC BALANCE INTEL: TO INDUCE FAT LOSS (CUTTING), DEPLOY A MODERATE ENERGY DEFICIT OF 300-500 KCAL. TO EXPAND CELLULAR MASS (BULKING), MAINTAIN A SURPLUS OF 250-500 KCAL WITH OVERLOAD.",
      "cut": "THERMODYNAMIC BALANCE INTEL: TO INDUCE FAT LOSS (CUTTING), DEPLOY A MODERATE ENERGY DEFICIT OF 300-500 KCAL. TO EXPAND CELLULAR MASS (BULKING), MAINTAIN A SURPLUS OF 250-500 KCAL WITH OVERLOAD.",
      "cardio": "CARDIORESPIRATORY PROTOCOL: ZONE 2 AEROBIC RUNS (60-70% MAX HR) FACILITATE MITOCHONDRIAL DENSITY AND RECOVERY KINETICS. HIIT SPARKS FAST-TWITCH METABOLISM BUT ACCUMULATES CNS FATIGUE.",
      "loss": "FAT LOSS ANALYSIS: SUSTAINED CALORIC DEFICIT IS COMPULSORY. PRIORITIZE HIGH-VOLUME, FIBROUS VEGETABLES AND A HIGH-PROTEIN RATIO TO SECURE SATIETY AND PROTECT MUSCLE STRUCTURE.",
      "lose": "FAT LOSS ANALYSIS: SUSTAINED CALORIC DEFICIT IS COMPULSORY. PRIORITIZE HIGH-VOLUME, FIBROUS VEGETABLES AND A HIGH-PROTEIN RATIO TO SECURE SATIETY AND PROTECT MUSCLE STRUCTURE.",
      "gain": "HYPERTROPHY TELEMETRY: INITIATE 10-20 WORKING SETS PER MUSCLE GROUP PER WEEK. RANGE BETWEEN 6-15 REPETITIONS CLOSE TO METABOLIC FAILURE. SECURE PROGRESSIVE OVERLOAD.",
      "build": "HYPERTROPHY TELEMETRY: INITIATE 10-20 WORKING SETS PER MUSCLE GROUP PER WEEK. RANGE BETWEEN 6-15 REPETITIONS CLOSE TO METABOLIC FAILURE. SECURE PROGRESSIVE OVERLOAD.",
      "muscle": "HYPERTROPHY TELEMETRY: INITIATE 10-20 WORKING SETS PER MUSCLE GROUP PER WEEK. RANGE BETWEEN 6-15 REPETITIONS CLOSE TO METABOLIC FAILURE. SECURE PROGRESSIVE OVERLOAD."
    };

    // Find first keyword match
    for (const key in responses) {
      if (text.includes(key)) {
        return responses[key];
      }
    }

    // Default responses
    const generalResponses = [
      "ACQUISITION PROTOCOLS ACTIVE. CONTINUE REPETITIONS. TRAIN PAST YOUR COMBUSTION THRESHOLD.",
      "THE HARDWARE REQUIRES CONSISTENCY. RESISTANCE IS INDISPENSABLE FOR TISSUE EXPANSION.",
      "DIAGNOSTIC ADVICE: INGEST QUANTIFIABLE CALORIES, TRACK REST TIMERS PRECISELY, AND INCREASE INTENSITY.",
      "SYSTEM RUNNING AT 98.4% CAPACITY. ENERGY RESERVES ARE OPTIMAL. PROCEED TO TRAIN.",
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleSend = async (textToSend?: string) => {
    const rawInput = textToSend || inputText;
    if (!rawInput.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: rawInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Stop listening if Speech Recognition is active
    if (isListening) {
      recognitionRef.current?.stop();
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      const savedKey = geminiApiKey || (typeof window !== "undefined" ? localStorage.getItem("codeflex_user_gemini_key") || "" : "");
      if (savedKey) {
        headers["x-gemini-key"] = savedKey;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: rawInput,
          history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Cloud intelligence offline or misconfigured");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const coachText = data.response;
      const coachMsg: Message = {
        id: Math.random().toString(),
        sender: "coach",
        text: coachText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, coachMsg]);
      setIsTyping(false);
      speakText(coachText);
    } catch (err: any) {
      console.warn("[SYS] API error. Checking fallback...", err);
      
      const isMissingKey = err?.message?.includes("GEMINI_API_KEY") || err?.message?.includes("API Key");
      if (isMissingKey) {
        setIsTyping(false);
        const errMsgText = "DIAGNOSTICS EXCEPTION: GEMINI API KEY IS NOT INSTALLED. ACCESS CRITICAL PATH VIA THE CONFIGURATION PANEL AT TOP TO LINK AN API KEY.";
        const coachMsg: Message = {
          id: Math.random().toString(),
          sender: "coach",
          text: errMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, coachMsg]);
        speakText(errMsgText);
        
        setTimeout(() => {
          setIsSettingsOpen(true);
        }, 1000);
        return;
      }

      console.warn("[SYS] API fall-through. Invoking offline rule-based diagnostic matrix...", err);
      // Offline fallback
      setTimeout(() => {
        const coachText = generateResponse(rawInput);
        const coachMsg: Message = {
          id: Math.random().toString(),
          sender: "coach",
          text: coachText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, coachMsg]);
        setIsTyping(false);
        speakText(coachText);
      }, 800);
    }
  };
  handleSendRef.current = handleSend;

  // Toggle speech listener
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <section className="relative z-10 pt-8 pb-32 container mx-auto px-4 max-w-4xl animate-page-enter font-mono text-xs">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 block mb-2">
          INTELLIGENCE LINKED // TELEMETRY
        </span>
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight flex items-center justify-center gap-2">
          <Terminal className="text-primary w-8 h-8" />
          AI Coach <span className="text-primary neon-text">Nova</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
      </div>

      {/* Main Terminal Chat Interface */}
      <div className="glass-card rounded-xl border border-border/80 flex flex-col h-[520px] relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <CornerElements />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-cyber-black/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">COACH_COMM_CHANNEL_ACTIVE</span>
          </div>

          {/* Toggle speech readbacks & API Config */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsSpeakingEnabled(!isSpeakingEnabled);
                playButtonHover();
              }}
              onMouseEnter={handleHover}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-bold transition-all duration-300 cursor-pointer ${
                isSpeakingEnabled 
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_8px_rgba(24,206,242,0.1)]"
                  : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {isSpeakingEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              {isSpeakingEnabled ? "SYNTH VOICE ON" : "SYNTH VOICE MUTED"}
            </button>

            <button
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
                playButtonHover();
              }}
              onMouseEnter={handleHover}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-bold transition-all duration-300 cursor-pointer ${
                isSettingsOpen || geminiApiKey
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_8px_rgba(24,206,242,0.1)]"
                  : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Settings size={12} className={isSettingsOpen ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
              {geminiApiKey ? "API KEY SECURED" : "CONFIG API KEY"}
            </button>
          </div>
        </div>

        {/* Settings Overlay */}
        {isSettingsOpen && (
          <div className="absolute inset-0 bg-cyber-black/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center animate-page-enter">
            <div className="max-w-md w-full glass-card p-6 border border-primary/30 rounded-xl relative shadow-[0_0_30px_rgba(24,206,242,0.15)] bg-cyber-dark/95">
              <CornerElements />
              <Settings className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-lg font-bold text-primary uppercase tracking-widest mb-2">
                Gemini AI Configuration
              </h2>
              <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed uppercase">
                An API Key is required to power NOVA&apos;s custom fitness intelligence. If not set on your server, enter it here. Your key is saved locally in your browser and never shared.
              </p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[9px] font-bold text-primary/70 uppercase tracking-wider block mb-1.5">
                    Gemini API Key
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-cyber-dark border border-border/80 focus:border-primary focus:outline-none rounded px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded p-3 text-[9px] text-muted-foreground leading-relaxed uppercase">
                  <span>No key? Get a free developer key from </span>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <Key size={10} />
                  </a>
                  <span> in seconds.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem("codeflex_user_gemini_key", geminiApiKey);
                      setIsSettingsOpen(false);
                      playButtonHover();
                      
                      const successMsg: Message = {
                        id: `sys_key_${Date.now()}`,
                        sender: "coach",
                        text: geminiApiKey 
                          ? "API KEY CONFIGURED SUCCESSFULLY. SYSTEM LINK OPERATIONAL. DIALOG MATRIX IS ONLINE." 
                          : "LOCAL KEY CLEARED. FALLING BACK TO SERVER CONFIGURATION.",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      };
                      setMessages(prev => [...prev, successMsg]);
                    }}
                    className="flex-1 py-2.5 rounded bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/80 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                  >
                    <Check size={14} />
                    Save Key
                  </button>

                  {geminiApiKey && (
                    <button
                      onClick={() => {
                        setGeminiApiKey("");
                        localStorage.removeItem("codeflex_user_gemini_key");
                        setIsSettingsOpen(false);
                        playButtonHover();
                        const clearMsg: Message = {
                          id: `sys_key_${Date.now()}`,
                          sender: "coach",
                          text: "LOCAL KEY UNLINKED. RELYING ON HOST TELEMETRY CONFIGURATION.",
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        };
                        setMessages(prev => [...prev, clearMsg]);
                      }}
                      className="px-3.5 rounded bg-destructive/15 border border-destructive/40 text-destructive hover:bg-destructive/25 transition-all duration-300 flex items-center justify-center cursor-pointer"
                      title="Clear Key"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      playButtonHover();
                    }}
                    className="px-4 py-2.5 rounded border border-border/80 text-foreground hover:bg-muted-foreground/10 transition-all duration-300 uppercase tracking-wider cursor-pointer text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Logs Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-cyber-black/20 custom-scroll">
          {messages.map((m) => {
            const isCoach = m.sender === "coach";
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] ${
                  isCoach ? "mr-auto items-start" : "ml-auto items-end"
                }`}
              >
                {/* Sender badge */}
                <span className={`text-[8px] font-bold tracking-widest mb-1 ${isCoach ? "text-primary" : "text-cyber-violet"}`}>
                  {isCoach ? "NOVA.EXE" : "ATHLETE.SYS"}
                </span>

                {/* Msg bubbles */}
                <div
                  className={`p-3.5 rounded-lg border leading-relaxed relative ${
                    isCoach
                      ? "bg-cyber-terminal-bg/90 border-border/80 text-foreground"
                      : "bg-cyber-violet/15 border-cyber-violet/40 text-foreground"
                  }`}
                  style={{
                    boxShadow: isCoach 
                      ? "inset 0 0 10px rgba(24,206,242,0.05)" 
                      : "inset 0 0 10px rgba(139,92,246,0.05)"
                  }}
                >
                  {/* Corner accents */}
                  <div className={`absolute top-0 w-1.5 h-1.5 border-t ${isCoach ? "left-0 border-l border-primary/30" : "right-0 border-r border-cyber-violet/30"}`} />
                  <div className={`absolute bottom-0 w-1.5 h-1.5 border-b ${isCoach ? "right-0 border-r border-primary/30" : "left-0 border-l border-cyber-violet/30"}`} />
                  
                  <p>{m.text}</p>
                </div>
                <span className="text-[7px] text-muted-foreground/50 mt-1 font-mono">{m.timestamp}</span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mr-auto items-start flex flex-col">
              <span className="text-[8px] font-bold tracking-widest mb-1 text-primary">NOVA.EXE</span>
              <div className="bg-cyber-terminal-bg/90 border border-border/80 p-3 rounded-lg flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Control Bar */}
        <div className="p-4 border-t border-border/40 bg-cyber-black/80 flex items-center gap-3">
          {/* Audio Input Button */}
          <button
            onClick={toggleSpeechRecognition}
            onMouseEnter={handleHover}
            className={`p-3 rounded-lg border shrink-0 flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isListening
                ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                : "bg-cyber-dark border-border/60 text-muted-foreground hover:text-primary hover:border-primary"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={isListening ? "DICTATION CAPTURING..." : "ENTER TACTICAL INPUT PROMPT..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isListening}
            className="flex-1 bg-cyber-dark border border-border/60 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/30 font-mono disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            onMouseEnter={handleHover}
            disabled={!inputText.trim()}
            className="p-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_10px_rgba(24,206,242,0.25)] transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoachChatPage;

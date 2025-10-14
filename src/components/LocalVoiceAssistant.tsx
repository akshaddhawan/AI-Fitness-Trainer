"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppServices } from "@/providers/AppServicesProvider";
import { generateLocalPlan } from "@/lib/local-generator";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";

const INTERVIEW_QUESTIONS = [
  {
    id: "stats",
    text: "Hi there! I am your CodeFlex AI Fitness Coach. I will help you build your personalized fitness program. To begin, how old are you, what is your height, and what is your current weight?",
    fallbackPrompt: "Age, height, and weight?",
  },
  {
    id: "injuries",
    text: "Got it. Do you have any physical injuries or limitations I should keep in mind?",
    fallbackPrompt: "Any injuries or physical limitations?",
  },
  {
    id: "frequency",
    text: "Understood. How many days a week would you like to work out?",
    fallbackPrompt: "How many days a week can you train?",
  },
  {
    id: "goal",
    text: "Great. What is your primary fitness goal? For example: weight loss, muscle gain, or general fitness?",
    fallbackPrompt: "What is your primary fitness goal?",
  },
  {
    id: "level",
    text: "Excellent. What is your current fitness level: beginner, intermediate, or advanced?",
    fallbackPrompt: "What is your fitness level (Beginner/Intermediate/Advanced)?",
  },
  {
    id: "diet",
    text: "Finally, do you have any dietary restrictions or allergies?",
    fallbackPrompt: "Any dietary restrictions or allergies?",
  },
];

const LocalVoiceAssistant = () => {
  const { user, createPlan } = useAppServices();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Voice controls
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micPermissionGranted, setMicPermissionGranted] = useState(true);
  
  // Text input fallback
  const [textInput, setTextInput] = useState("");

  const recognitionRef = useRef<any>(null);
  const speechUtteranceRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserResponseRef = useRef(handleUserResponse);
  handleUserResponseRef.current = handleUserResponse;

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeech = "speechSynthesis" in window;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const hasRecognition = !!SpeechRecognition;

      setSpeechSupported(hasSpeech);
      setRecognitionSupported(hasRecognition);

      if (hasRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          console.log("Speech recognition started");
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Speech detected:", transcript);
          handleUserResponseRef.current(transcript);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setMicPermissionGranted(false);
          }
          setIsSpeaking(false);
        };

        rec.onend = () => {
          console.log("Speech recognition ended");
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!speechSupported || !voiceEnabled) {
      if (onEndCallback) onEndCallback();
      return;
    }

    stopSpeaking();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Customize voice a bit (try to find a nice English voice)
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (recognitionRef.current && recognitionSupported && micPermissionGranted) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
  };

  const startInterview = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setCallActive(true);
      setCurrentQuestionIdx(0);
      setAnswers({});
      
      const firstQuestion = INTERVIEW_QUESTIONS[0];
      setMessages([{ role: "assistant", content: firstQuestion.text }]);
      
      speakText(firstQuestion.text, () => {
        startListening();
      });
    }, 1000);
  };

  function handleUserResponse(text: string) {
    if (!text.trim()) return;

    // Add user response to chat
    setMessages(prev => [...prev, { role: "user", content: text }]);
    stopListening();

    // Record answer
    const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIdx];
    const updatedAnswers = { ...answers, [currentQuestion.id]: text };
    setAnswers(updatedAnswers);

    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < INTERVIEW_QUESTIONS.length) {
      setCurrentQuestionIdx(nextIdx);
      const nextQuestion = INTERVIEW_QUESTIONS[nextIdx];
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: nextQuestion.text }]);
        speakText(nextQuestion.text, () => {
          startListening();
        });
      }, 800);
    } else {
      // Completed interview!
      handleInterviewComplete(updatedAnswers);
    }
  };

  const handleInterviewComplete = (finalAnswers: Record<string, string>) => {
    const completeText = "Excellent! I've gathered all the details. I am compiling your custom training program and meal plan now. Get ready!";
    setMessages(prev => [...prev, { role: "assistant", content: completeText }]);
    
    speakText(completeText, () => {
      setMessages(prev => [...prev, { role: "system", content: "Compiling exercises, sets, and reps..." }]);
      
      setTimeout(async () => {
        setMessages(prev => [...prev, { role: "system", content: "Calculating optimal caloric targets & meals..." }]);
        
        // Parse user answers to construct profile
        const rawStats = finalAnswers.stats || "";
        
        // Simple regex to parse numbers from input
        const ageMatch = rawStats.match(/(\d+)\s*(?:years|y|yo)/i) || rawStats.match(/\b(\d+)\b/);
        const age = ageMatch ? parseInt(ageMatch[1]) : 30;
        
        const weightMatch = rawStats.match(/(\d+)\s*(?:lbs|kg|pounds)/i) || rawStats.match(/\b(\d+)\b/);
        const weight = weightMatch ? parseInt(weightMatch[1]) : 160;

        const rawDays = finalAnswers.frequency || "";
        const daysMatch = rawDays.match(/(\d+)\b/);
        const workoutDays = daysMatch ? parseInt(daysMatch[1]) : 3;

        // Construct profile
        const fitnessProfile = {
          age,
          height: rawStats.includes("'") ? rawStats.substring(rawStats.indexOf("'") - 1, rawStats.indexOf("'") + 3) : "5'8\"",
          weight,
          injuries: finalAnswers.injuries || "none",
          workoutDays,
          fitnessGoal: finalAnswers.goal || "General Fitness",
          fitnessLevel: finalAnswers.level || "Beginner",
          dietaryRestrictions: finalAnswers.diet || "none",
        };

        try {
          const generatedPlan = generateLocalPlan(fitnessProfile);
          await createPlan(generatedPlan);

          setCallEnded(true);
          setCallActive(false);

          setTimeout(() => {
            router.push("/profile");
          }, 1500);

        } catch (error) {
          console.error("Plan creation failed", error);
          setMessages(prev => [...prev, { role: "system", content: "Error creating plan. Please check logs." }]);
        }
      }, 1500);
    });
  };

  const toggleCall = () => {
    if (callActive) {
      stopSpeaking();
      stopListening();
      setCallActive(false);
      setCallEnded(true);
      setMessages(prev => [...prev, { role: "system", content: "Call ended by user." }]);
    } else {
      startInterview();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const response = textInput;
    setTextInput("");
    handleUserResponse(response);
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      // Repeat the current question if audio is toggled back on
      if (callActive && !isSpeaking) {
        speakText(INTERVIEW_QUESTIONS[currentQuestionIdx].text, () => {
          startListening();
        });
      }
    }
  };

  const getStatusText = () => {
    if (callEnded) return "Redirecting to profile...";
    if (connecting) return "Connecting...";
    if (!callActive) return "Waiting...";
    if (isSpeaking) return "Speaking...";
    return "Listening...";
  };

  return (
    <div className="w-full">
      {/* VIDEO CALL AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI ASSISTANT CARD */}
        <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* AI VOICE ANIMATION */}
            <div
              className={`absolute inset-0 ${
                isSpeaking ? "opacity-30" : "opacity-0"
              } transition-opacity duration-300`}
            >
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                      isSpeaking ? "animate-sound-wave" : ""
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* AI IMAGE */}
            <div className="relative size-32 mb-4">
              <div
                className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
              />

              <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>
                <img
                  src="/ai-avatar.png"
                  alt="AI Assistant"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              CodeFlex AI
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono font-normal">LOCAL</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-mono">Fitness & Diet Coach</p>

            {/* SPEAKING INDICATOR */}
            <div
              className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                isSpeaking ? "border-primary" : ""
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                }`}
              />
              <span className="text-xs text-muted-foreground font-mono">
                {getStatusText()}
              </span>
            </div>
          </div>
        </Card>

        {/* USER CARD */}
        <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* User Image */}
            <div className="relative size-32 mb-4">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="User"
                  className="size-full object-cover rounded-full border border-border"
                />
              ) : (
                <div className="size-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border border-border">
                  <span className="text-4xl font-bold text-primary">
                    {user?.firstName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground">
              {user ? user.fullName : "Guest"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {user ? user.primaryEmailAddress?.emailAddress : "Local Session"}
            </p>

            {/* User Ready Text */}
            <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
              <div className={`w-2 h-2 rounded-full ${callActive && !isSpeaking ? "bg-green-500 animate-pulse" : "bg-muted"}`} />
              <span className="text-xs text-muted-foreground font-mono">
                {callActive && !isSpeaking ? "Speaking/Typing..." : "Ready"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* AUDIO CONTROL OVERLAYS */}
      {callActive && (
        <div className="flex justify-end gap-3 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleVoice}
            className={`border-border ${!voiceEnabled ? "text-destructive border-destructive/40" : "text-muted-foreground"}`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 mr-1.5" /> : <VolumeX className="h-4 w-4 mr-1.5" />}
            {voiceEnabled ? "Mute Voice" : "Unmute Voice"}
          </Button>

          {recognitionSupported && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMicPermissionGranted(!micPermissionGranted)}
              className={`border-border ${!micPermissionGranted ? "text-destructive border-destructive/40" : "text-muted-foreground"}`}
            >
              {micPermissionGranted ? <Mic className="h-4 w-4 mr-1.5" /> : <MicOff className="h-4 w-4 mr-1.5" />}
              {micPermissionGranted ? "Mic Allowed" : "Mic Off"}
            </Button>
          )}
        </div>
      )}

      {/* MESSAGE CONTAINER */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-5 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth shadow-inner"
        >
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`message-item animate-fadeIn ${msg.role === "user" ? "text-right" : ""}`}>
                <div className="font-mono text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
                  {msg.role === "assistant" ? "CodeFlex AI" : msg.role === "system" ? "System" : "You"}:
                </div>
                <p className={`inline-block text-sm px-3.5 py-2 rounded-lg max-w-[85%] ${
                  msg.role === "assistant" 
                    ? "bg-muted/50 border border-border text-foreground text-left" 
                    : msg.role === "system" 
                      ? "bg-primary/10 border border-primary/20 text-primary text-left font-mono text-xs" 
                      : "bg-primary/20 border border-primary/30 text-foreground text-left"
                }`}>
                  {msg.content}
                </p>
              </div>
            ))}

            {callEnded && (
              <div className="message-item animate-fadeIn">
                <div className="font-semibold text-xs text-primary mb-1 font-mono">SYSTEM:</div>
                <p className="text-foreground text-sm bg-primary/10 border border-primary/30 px-3.5 py-2 rounded-lg">
                  Your fitness program has been successfully compiled and saved to local storage! Redirecting to profile...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEXT INPUT FORM FALLBACK */}
      {callActive && !isSpeaking && (
        <form onSubmit={handleTextSubmit} className="flex gap-2.5 mb-8 w-full">
          <input
            type="text"
            placeholder={
              micPermissionGranted && recognitionSupported
                ? "Talk to speak, or type your response here..."
                : "Type your response here..."
            }
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={callEnded}
            className="flex-grow bg-cyber-terminal-bg border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-mono"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!textInput.trim() || callEnded}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* CALL CONTROLS */}
      <div className="w-full flex justify-center gap-4">
        <Button
          className={`w-48 text-lg rounded-3xl font-mono ${
            callActive
              ? "bg-destructive hover:bg-destructive/90"
              : callEnded
                ? "bg-green-600 hover:bg-green-700"
                : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-[0_0_15px_rgba(24,206,242,0.3)] hover:shadow-[0_0_25px_rgba(24,206,242,0.6)]"
          } text-white transition-all duration-300 relative`}
          onClick={toggleCall}
          disabled={connecting || callEnded}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
          )}

          <span>
            {callActive
              ? "End Call"
              : connecting
                ? "Connecting..."
                : callEnded
                  ? "View Profile"
                  : "Start Call"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default LocalVoiceAssistant;

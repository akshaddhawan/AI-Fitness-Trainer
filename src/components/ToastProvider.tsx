"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const typeStyles = {
    success: {
      border: "border-primary",
      bg: "bg-cyber-terminal-bg/90",
      icon: <CheckCircle className="w-5 h-5 text-primary animate-glow" />,
      text: "text-primary",
      titleColor: "text-primary font-bold font-mono text-xs tracking-wider",
    },
    info: {
      border: "border-cyber-violet",
      bg: "bg-cyber-terminal-bg/90",
      icon: <Info className="w-5 h-5 text-cyber-violet" />,
      text: "text-foreground",
      titleColor: "text-cyber-violet font-bold font-mono text-xs tracking-wider",
    },
    warning: {
      border: "border-cyber-gold",
      bg: "bg-cyber-terminal-bg/90",
      icon: <AlertCircle className="w-5 h-5 text-cyber-gold" />,
      text: "text-foreground",
      titleColor: "text-cyber-gold font-bold font-mono text-xs tracking-wider",
    },
    error: {
      border: "border-cyber-magenta",
      bg: "bg-cyber-terminal-bg/90",
      icon: <AlertCircle className="w-5 h-5 text-cyber-magenta" />,
      text: "text-cyber-magenta",
      titleColor: "text-cyber-magenta font-bold font-mono text-xs tracking-wider",
    },
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const style = typeStyles[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative flex gap-3 p-4 rounded-lg border backdrop-blur-md transition-all duration-300 animate-slide-in-right shadow-[0_4px_15px_rgba(0,0,0,0.4)] ${style.border} ${style.bg}`}
              style={{
                boxShadow: t.type === "success" 
                  ? "0 0 15px rgba(24,206,242,0.15)"
                  : t.type === "info"
                  ? "0 0 15px rgba(139,92,246,0.15)"
                  : t.type === "warning"
                  ? "0 0 15px rgba(234,179,8,0.15)"
                  : "0 0 15px rgba(236,72,153,0.15)"
              }}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20" />

              <div className="shrink-0">{style.icon}</div>
              
              <div className="flex-1 min-w-0">
                {t.title && <div className={style.titleColor}>{t.title.toUpperCase()}</div>}
                <div className={`text-xs mt-0.5 leading-relaxed font-mono ${t.type === "error" ? "text-cyber-magenta" : "text-muted-foreground"}`}>
                  {t.message}
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 h-4 w-4 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

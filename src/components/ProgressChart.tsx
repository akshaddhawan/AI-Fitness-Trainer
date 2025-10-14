"use client";

import React, { useEffect, useRef, useState } from "react";
import { DailyLog, useAppServices } from "@/providers/AppServicesProvider";

const ProgressChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getDailyHistory } = useAppServices();
  const [activeMetric, setActiveMetric] = useState<"workouts" | "water" | "calories">("workouts");
  const [hoveredData, setHoveredData] = useState<{ x: number; y: number; val: string; date: string } | null>(null);

  const history = getDailyHistory(7); // Last 7 entries
  // Reverse to show chronological order (left to right)
  const chartData = [...history].reverse();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationProgress = 0;
    let animId: number;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 30, bottom: 40, left: 50 };

    const metricConfigs = {
      workouts: {
        color: "#18cef2", // Cyan
        glow: "rgba(24, 206, 242, 0.4)",
        label: "Workouts",
        getMax: (data: DailyLog[]) => Math.max(2, ...data.map(d => d.workoutsCompleted)),
        getValue: (item: DailyLog) => item.workoutsCompleted,
        format: (val: number) => `${val} session${val !== 1 ? "s" : ""}`,
      },
      water: {
        color: "#8b5cf6", // Violet
        glow: "rgba(139, 92, 246, 0.4)",
        label: "Water Intake",
        getMax: (data: DailyLog[]) => Math.max(3000, ...data.map(d => d.water)),
        getValue: (item: DailyLog) => item.water,
        format: (val: number) => `${val} ml`,
      },
      calories: {
        color: "#f97316", // Orange
        glow: "rgba(249, 115, 22, 0.4)",
        label: "Calories Logged",
        getMax: (data: DailyLog[]) => Math.max(2500, ...data.map(d => d.calories)),
        getValue: (item: DailyLog) => item.calories,
        format: (val: number) => `${val} kcal`,
      },
    };

    const config = metricConfigs[activeMetric];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const maxVal = config.getMax(chartData);
      const points: { x: number; y: number; val: number; date: string }[] = [];

      // X/Y Axis scales
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Draw Grid Lines (Horizontal)
      ctx.strokeStyle = "rgba(24, 206, 242, 0.05)";
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";

      const gridLines = 4;
      for (let i = 0; i <= gridLines; i++) {
        const yVal = (maxVal / gridLines) * i;
        const y = padding.top + chartHeight - (yVal / maxVal) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillText(Math.round(yVal).toLocaleString(), padding.left - 10, y + 3);
      }

      // Compute points
      chartData.forEach((item, index) => {
        const x = padding.left + (index / (chartData.length - 1 || 1)) * chartWidth;
        const rawVal = config.getValue(item);
        const animatedVal = rawVal * animationProgress;
        const y = padding.top + chartHeight - (animatedVal / maxVal) * chartHeight;
        
        // Strip out year for label
        const dateObj = new Date(item.date);
        const label = isNaN(dateObj.getTime()) ? item.date : dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        
        points.push({ x, y, val: rawVal, date: label });
      });

      // Draw Chart Line
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = config.color;
        ctx.stroke();
        
        // Disable shadow for other drawings
        ctx.shadowBlur = 0;

        // Draw Gradient Fill under line
        const fillGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        fillGradient.addColorStop(0, `${config.color}25`);
        fillGradient.addColorStop(1, `${config.color}00`);
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = fillGradient;
        ctx.fill();

        // Draw point dots and X labels
        points.forEach((p) => {
          // X labels
          ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.fillText(p.date, p.x, height - padding.bottom + 18);

          // Dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = config.color;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
        });
      }

      // Progress animation
      if (animationProgress < 1) {
        animationProgress += 0.05;
        if (animationProgress > 1) animationProgress = 1;
        animId = requestAnimationFrame(draw);
      }
    };

    draw();

    // Hover handler
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left;

      let activePoint: { x: number; y: number; val: number; date: string } | null = null;
      let minDistance = 25; // Tolerance

      chartData.forEach((item, index) => {
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const pX = padding.left + (index / (chartData.length - 1 || 1)) * chartWidth;
        const maxVal = config.getMax(chartData);
        const pY = padding.top + chartHeight - (config.getValue(item) / maxVal) * chartHeight;
        
        const dist = Math.abs(x - pX);
        if (dist < minDistance) {
          minDistance = dist;
          const dateObj = new Date(item.date);
          const label = isNaN(dateObj.getTime()) ? item.date : dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          activePoint = { x: pX, y: pY, val: config.getValue(item), date: label };
        }
      });

      if (activePoint) {
        setHoveredData({
          x: (activePoint as any).x,
          y: (activePoint as any).y,
          val: config.format((activePoint as any).val),
          date: (activePoint as any).date,
        });
      } else {
        setHoveredData(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredData(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeMetric, chartData]);

  return (
    <div className="glass-card rounded-xl p-4 md:p-6 w-full flex flex-col gap-4 font-mono relative overflow-hidden">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/30" />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Progress Metrics</h3>
          <p className="text-sm font-bold text-foreground">Weekly Statistics</p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-1 bg-cyber-black/50 p-1 border border-border/30 rounded-lg">
          {(["workouts", "water", "calories"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all duration-300 ${
                activeMetric === m
                  ? m === "workouts"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : m === "water"
                    ? "bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30"
                    : "bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-48 sm:h-56">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

        {/* Tooltip Overlay */}
        {hoveredData && (
          <div
            className="absolute z-10 bg-cyber-terminal-bg border border-border/70 rounded p-2 text-[10px] pointer-events-none shadow-[0_0_10px_rgba(24,206,242,0.15)] flex flex-col gap-0.5 animate-fadeIn"
            style={{
              left: `${hoveredData.x - 50}px`,
              top: `${hoveredData.y - 50}px`,
              width: "100px",
            }}
          >
            <span className="text-muted-foreground">{hoveredData.date}</span>
            <span className="text-foreground font-bold font-mono">{hoveredData.val}</span>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyber-black/20 backdrop-blur-[1px]">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">No activity logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;

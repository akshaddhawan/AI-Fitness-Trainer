"use client";

import React from "react";

const AnimatedCube = () => {
  return (
    <div className="perspective-container flex items-center justify-center h-48 w-48 relative">
      <div className="cube">
        {/* Front Face: 💪 */}
        <div className="cube-face cube-face-front">
          <span>💪</span>
        </div>
        {/* Back Face: 🧠 */}
        <div className="cube-face cube-face-back">
          <span>🧠</span>
        </div>
        {/* Right Face: 🏋️‍♂️ */}
        <div className="cube-face cube-face-right">
          <span>🏋️‍♂️</span>
        </div>
        {/* Left Face: 🥗 */}
        <div className="cube-face cube-face-left">
          <span>🥗</span>
        </div>
        {/* Top Face: 🔥 */}
        <div className="cube-face cube-face-top">
          <span>🔥</span>
        </div>
        {/* Bottom Face: ⚡ */}
        <div className="cube-face cube-face-bottom">
          <span>⚡</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCube;

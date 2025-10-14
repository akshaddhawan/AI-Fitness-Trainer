let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";

  // Ascending major chord sweep
  osc.frequency.setValueAtTime(261.63, now); // C4
  osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
  osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
  osc.frequency.setValueAtTime(523.25, now + 0.3); // C5

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

  osc.start(now);
  osc.stop(now + 0.65);
}

export function playTickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "triangle";
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function playAlarmSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Beep 1
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(587.33, now); // D5
  gain1.gain.setValueAtTime(0.12, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Beep 2 (delayed by 150ms)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(587.33, now + 0.15); // D5
  gain2.gain.setValueAtTime(0.12, now + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.27);
}

export function playAchievementUnlock() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Ascending pentatonic/magical arpeggio
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
    
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.4);
  });
}

export function playWaterDrop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Quick frequency sweep upwards to simulate a "plop" water sound
  osc.type = "sine";
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.start(now);
  osc.stop(now + 0.15);
}

export function playLevelUp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Epic layered chord (C major: C3, G3, C4, E4, G4)
  const chord = [130.81, 196.00, 261.63, 329.63, 392.00];
  
  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Waveform mixture: triangle for warmth, sine for purity
    osc.type = idx % 2 === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, now);
    
    // Slight detune for fatness
    if (idx > 0) {
      osc.detune.setValueAtTime((Math.random() - 0.5) * 15, now);
    }

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.start(now);
    osc.stop(now + 1.2);
  });
}

export function playButtonHover() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // High-frequency short tick
  osc.type = "sine";
  osc.frequency.setValueAtTime(1500, now);
  
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.start(now);
  osc.stop(now + 0.03);
}

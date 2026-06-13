import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useLocation } from "wouter";

// ─── Random glitch slices generated per transition ────────────────────────────
interface Slice {
  top: number;       // % from top
  height: number;    // px
  offsetX: number;   // px x-jitter
  color: string;
  delay: number;     // s
}

function genSlices(): Slice[] {
  const palette = [
    "rgba(110,84,255,0.85)",
    "rgba(255,30,80,0.75)",
    "rgba(0,220,200,0.65)",
    "rgba(255,255,255,0.4)",
  ];
  return Array.from({ length: 7 }, () => ({
    top:    4 + Math.random() * 88,
    height: 1 + Math.random() * 8,
    offsetX: (Math.random() - 0.5) * 60,
    color:  palette[Math.floor(Math.random() * palette.length)],
    delay:  Math.random() * 0.22,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlitchTransition() {
  const [location]  = useLocation();
  const [visible,   setVisible]  = useState(false);
  const [slices,    setSlices]   = useState<Slice[]>([]);
  const [sliceKey,  setSliceKey] = useState(0);

  const overlayCtrl = useAnimation();
  const glowCtrl    = useAnimation();
  const rCtrl       = useAnimation();
  const cCtrl       = useAnimation();

  const prevLoc  = useRef(location);
  const running  = useRef(false);

  useEffect(() => {
    if (location === prevLoc.current) return;
    prevLoc.current = location;

    // Abort any in-flight transition
    if (running.current) {
      overlayCtrl.stop();
      glowCtrl.stop();
      rCtrl.stop();
      cCtrl.stop();
    }

    setSlices(genSlices());
    setSliceKey(k => k + 1);
    setVisible(true);
    running.current = true;

    async function run() {
      const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
      const COVER_MS  = 340;
      const HOLD_MS   = 60;
      const REVEAL_MS = 400;

      // ── Phase 1: wipe DOWN (cover old page) ──────────────────────────────
      overlayCtrl.set({ clipPath: "inset(0 0 100% 0)" });
      glowCtrl.set({ top: "0%" });
      rCtrl.set({ top: "-2px" });
      cCtrl.set({ top: "1px" });

      await Promise.all([
        overlayCtrl.start({
          clipPath: "inset(0 0 0% 0)",
          transition: { duration: COVER_MS / 1000, ease: EASE },
        }),
        glowCtrl.start({
          top: "100%",
          transition: { duration: COVER_MS / 1000, ease: EASE },
        }),
        rCtrl.start({
          top: "calc(100% - 2px)",
          transition: { duration: COVER_MS / 1000, ease: EASE },
        }),
        cCtrl.start({
          top: "calc(100% + 1px)",
          transition: { duration: COVER_MS / 1000, ease: EASE },
        }),
      ]);

      await new Promise(r => setTimeout(r, HOLD_MS));

      // ── Phase 2: wipe UP (reveal new page) ───────────────────────────────
      overlayCtrl.set({ clipPath: "inset(0 0 0% 0)" });
      glowCtrl.set({ top: "0%" });
      rCtrl.set({ top: "-2px" });
      cCtrl.set({ top: "1px" });

      await Promise.all([
        overlayCtrl.start({
          clipPath: "inset(100% 0 0% 0)",
          transition: { duration: REVEAL_MS / 1000, ease: EASE },
        }),
        glowCtrl.start({
          top: "100%",
          transition: { duration: REVEAL_MS / 1000, ease: EASE },
        }),
        rCtrl.start({
          top: "calc(100% - 2px)",
          transition: { duration: REVEAL_MS / 1000, ease: EASE },
        }),
        cCtrl.start({
          top: "calc(100% + 1px)",
          transition: { duration: REVEAL_MS / 1000, ease: EASE },
        }),
      ]);

      setVisible(false);
      running.current = false;
    }

    run();
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>

      {/* ── Main black overlay (clip-path wipe) ─────────────────────────── */}
      <motion.div
        animate={overlayCtrl}
        className="absolute inset-0"
        style={{ background: "#060606" }}
      />

      {/* ── Scanlines on the overlay ─────────────────────────────────────── */}
      <motion.div
        animate={overlayCtrl}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* ── Leading-edge purple glow bar ─────────────────────────────────── */}
      <motion.div
        animate={glowCtrl}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: "3px",
          background: "linear-gradient(90deg, transparent 0%, #6E54FF 15%, #fff 50%, #6E54FF 85%, transparent 100%)",
          filter: "blur(1.5px)",
          boxShadow: "0 0 18px 3px rgba(110,84,255,0.75)",
        }}
      />

      {/* ── Red channel offset bar ───────────────────────────────────────── */}
      <motion.div
        animate={rCtrl}
        className="absolute pointer-events-none"
        style={{
          left: "-5px",
          right: "5px",
          height: "2px",
          background: "rgba(255,30,80,0.75)",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Cyan channel offset bar ──────────────────────────────────────── */}
      <motion.div
        animate={cCtrl}
        className="absolute pointer-events-none"
        style={{
          left: "5px",
          right: "-5px",
          height: "2px",
          background: "rgba(0,220,200,0.65)",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Glitch slices (random horizontal bursts) ─────────────────────── */}
      {slices.map((s, i) => (
        <motion.div
          key={`${sliceKey}-${i}`}
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${s.top}%`,
            height: `${s.height}px`,
            background: s.color,
            mixBlendMode: "screen",
          }}
          initial={{ x: 0, opacity: 0, scaleX: 0.3 }}
          animate={{
            x:       [0, s.offsetX, -s.offsetX * 0.6, s.offsetX * 0.3, 0],
            opacity: [0, 0.9, 0.7, 0.5, 0],
            scaleX:  [0.3, 1, 1, 0.8, 0.1],
          }}
          transition={{
            duration: 0.22,
            delay:    s.delay,
            ease:     "linear",
          }}
        />
      ))}

      {/* ── Corner tick marks (CRT UI chrome) ────────────────────────────── */}
      {[
        "top-2 left-2",
        "top-2 right-2",
        "bottom-2 left-2",
        "bottom-2 right-2",
      ].map(pos => (
        <motion.div
          key={pos}
          className={`absolute ${pos} w-4 h-4 pointer-events-none`}
          style={{
            borderColor: "rgba(110,84,255,0.6)",
            borderStyle: "solid",
            borderWidth: pos.includes("top") && pos.includes("left")   ? "2px 0 0 2px"   :
                         pos.includes("top") && pos.includes("right")  ? "2px 2px 0 0"   :
                         pos.includes("bottom") && pos.includes("left") ? "0 0 2px 2px"  : "0 2px 2px 0",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1, 0] }}
          transition={{ duration: 0.6, delay: 0.05 }}
        />
      ))}
    </div>
  );
}

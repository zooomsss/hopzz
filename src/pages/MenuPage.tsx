import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useAnimationFrame, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
const menuBg = "/5b711ef79785d61e3fb0f5a05de656be.webp";
const eye1 = "/272723742c11fba2d41a831dee177fbc.webp";
const eye2 = "/2ae7f8c83a39b07b98af621d7d10a235.webp";
const eye3 = "/4667a51274dabb41dbcc2ab3db3ba6de.webp";
const eye4 = "/ae5781de1d00a09072b464acb5691625.webp";
const eye5 = "/fc5b18481973e1979078359605e9506f.webp";

// ─── Constants ──────────────────────────────────────────────────────────────
const MON_W = 190;
const MON_H = 160;

const MONITORS = [
  { id: "M-01", label: "目・壱", sublabel: "ORIGIN",  image: eye1, glitchDelay: 0   },
  { id: "M-02", label: "目・弐", sublabel: "CHAOS",   image: eye2, glitchDelay: 1.4 },
  { id: "M-03", label: "目・参", sublabel: "STARS",   image: eye3, glitchDelay: 2.8 },
  { id: "M-04", label: "目・四", sublabel: "HEAVEN",  image: eye4, glitchDelay: 0.7 },
  { id: "M-05", label: "目・伍", sublabel: "SORROW",  image: eye5, glitchDelay: 2.1 },
];

// Initial positions (top-left corner of each monitor inside container)
const INIT_POS = [
  { x: 10,  y: 20  },
  { x: 220, y: 5   },
  { x: 430, y: 25  },
  { x: 80,  y: 210 },
  { x: 350, y: 200 },
];

// Cable connections between monitor indices
const CABLES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [2, 4], [3, 4], [1, 3], [1, 4],
];

const LORE_ENTRIES = [
  {
    id: "001",
    jpTitle: "第一章：目醒め",
    enTitle: "Chapter I: Awakening",
    text: "In the dead signal of 2031, five digital entities emerged from corrupted blockchain nodes. They called themselves HOPZ — beings born from failed transactions and ghost data. Their eyes see through the veil of every chain.",
    jp: "2031年の死んだ信号の中で、五つのデジタル存在が破損したブロックチェーンノードから現れた。",
  },
  {
    id: "002",
    jpTitle: "第二章：呪いのコード",
    enTitle: "Chapter II: The Cursed Code",
    text: "Each NFT carries a fragment of their consciousness — a hexadecimal shard of memory. To mint is to inherit their gaze. They watch from every screen, every monitor, every dead pixel.",
    jp: "NFTはそれぞれ彼らの意識の断片を持つ。ミントするということは、その眼差しを受け継ぐことだ。",
  },
  {
    id: "003",
    jpTitle: "第三章：永遠の監視",
    enTitle: "Chapter III: Eternal Watch",
    text: "3,333 tokens. 3,333 pairs of eyes open in the dark. The blockchain never sleeps. Neither do they. Once you enter the HOPZ dimension, the signal cannot be severed.",
    jp: "3,333トークン。暗闇の中で開く3,333対の瞳。ブロックチェーンは眠らない。彼らも同様だ。",
  },
];

// Module-level ref: DraggableMonitor writes, AnimeBg reads (no React re-renders)
const hoveredMonitorRef = { current: false };

// ─── Cable SVG Layer ─────────────────────────────────────────────────────────
function cablePathD(x1: number, y1: number, x2: number, y2: number): string {
  const droop = 55 + Math.abs(y2 - y1) * 0.25 + Math.abs(x2 - x1) * 0.05;
  const cx = (x1 + x2) / 2;
  const cy = Math.max(y1, y2) + droop;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

interface CableLayerProps {
  mxArr: ReturnType<typeof useMotionValue>[];
  myArr: ReturnType<typeof useMotionValue>[];
}

const N_PER_CABLE = 4;
const CABLE_SPEEDS = [0.0026, 0.0019, 0.0023, 0.0031, 0.0017, 0.0028, 0.0022];
const PARTICLE_COLORS = ["#6E54FF", "#00FFCC", "#6E54FF", "#FF6EDD"];

function getBezierPoint(t: number, x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number) {
  const mt = 1 - t;
  return { x: mt * mt * x1 + 2 * mt * t * cpx + t * t * x2, y: mt * mt * y1 + 2 * mt * t * cpy + t * t * y2 };
}

function CableLayer({ mxArr, myArr }: CableLayerProps) {
  const mainPaths  = useRef<(SVGPathElement   | null)[]>(CABLES.map(() => null));
  const glowPaths  = useRef<(SVGPathElement   | null)[]>(CABLES.map(() => null));
  const TOTAL = CABLES.length * N_PER_CABLE;
  const pDots      = useRef<(SVGCircleElement | null)[]>(Array(TOTAL).fill(null));
  const pGlows     = useRef<(SVGCircleElement | null)[]>(Array(TOTAL).fill(null));
  const pTs        = useRef<number[]>(
    Array.from({ length: TOTAL }, (_, k) => (k % N_PER_CABLE) / N_PER_CABLE)
  );

  useAnimationFrame(() => {
    CABLES.forEach(([i, j], ci) => {
      const x1  = INIT_POS[i].x + mxArr[i].get() + MON_W / 2;
      const y1  = INIT_POS[i].y + myArr[i].get() + MON_H;
      const x2  = INIT_POS[j].x + mxArr[j].get() + MON_W / 2;
      const y2  = INIT_POS[j].y + myArr[j].get() + MON_H;
      const droop = 55 + Math.abs(y2 - y1) * 0.25 + Math.abs(x2 - x1) * 0.05;
      const cpx = (x1 + x2) / 2;
      const cpy = Math.max(y1, y2) + droop;
      const d = `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
      mainPaths.current[ci]?.setAttribute("d", d);
      glowPaths.current[ci]?.setAttribute("d", d);

      const speed = CABLE_SPEEDS[ci % CABLE_SPEEDS.length];
      for (let pi = 0; pi < N_PER_CABLE; pi++) {
        const flat = ci * N_PER_CABLE + pi;
        pTs.current[flat] = (pTs.current[flat] + speed) % 1;
        const { x, y } = getBezierPoint(pTs.current[flat], x1, y1, cpx, cpy, x2, y2);
        pDots .current[flat]?.setAttribute("cx", String(x));
        pDots .current[flat]?.setAttribute("cy", String(y));
        pGlows.current[flat]?.setAttribute("cx", String(x));
        pGlows.current[flat]?.setAttribute("cy", String(y));
      }
    });
  });

  const initialDs = CABLES.map(([i, j]) =>
    cablePathD(INIT_POS[i].x + MON_W / 2, INIT_POS[i].y + MON_H,
               INIT_POS[j].x + MON_W / 2, INIT_POS[j].y + MON_H)
  );

  // Compute initial particle positions for first render
  const initParticlePos = CABLES.map(([i, j], ci) => {
    const x1  = INIT_POS[i].x + MON_W / 2; const y1 = INIT_POS[i].y + MON_H;
    const x2  = INIT_POS[j].x + MON_W / 2; const y2 = INIT_POS[j].y + MON_H;
    const cpx = (x1 + x2) / 2; const cpy = Math.max(y1, y2) + 55;
    return Array.from({ length: N_PER_CABLE }, (_, pi) => {
      const t = pi / N_PER_CABLE;
      return getBezierPoint(t, x1, y1, cpx, cpy, x2, y2);
    });
  });

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: "100%", height: "100%", zIndex: 0 }}>
      <defs>
        <filter id="cableGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pGlow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="pGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%"  stopColor="#6E54FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6E54FF" stopOpacity="0" />
        </radialGradient>
        <marker id="arrowEnd" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <circle cx="2" cy="2" r="1.5" fill="#6E54FF" opacity="0.6" />
        </marker>
      </defs>

      {/* Glow layer cables */}
      {CABLES.map((_, idx) => (
        <path key={`glow-${idx}`} ref={el => { glowPaths.current[idx] = el; }}
          d={initialDs[idx]} fill="none" stroke="#6E54FF"
          strokeWidth="5" strokeOpacity="0.1" filter="url(#cableGlow)" />
      ))}

      {/* Main cables */}
      {CABLES.map((_, idx) => (
        <path key={`main-${idx}`} ref={el => { mainPaths.current[idx] = el; }}
          d={initialDs[idx]} fill="none" stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.2" strokeLinecap="round"
          strokeDasharray={idx % 2 === 0 ? "none" : "5 3"}
          markerEnd="url(#arrowEnd)" />
      ))}

      {/* Particle glow halos */}
      {CABLES.map((_, ci) =>
        Array.from({ length: N_PER_CABLE }, (_, pi) => {
          const flat = ci * N_PER_CABLE + pi;
          const { x, y } = initParticlePos[ci][pi];
          return (
            <circle key={`pg-${ci}-${pi}`}
              ref={el => { pGlows.current[flat] = el; }}
              cx={x} cy={y} r="7"
              fill={PARTICLE_COLORS[pi % PARTICLE_COLORS.length]}
              opacity="0.2" filter="url(#pGlow)" />
          );
        })
      )}

      {/* Particle dots */}
      {CABLES.map((_, ci) =>
        Array.from({ length: N_PER_CABLE }, (_, pi) => {
          const flat = ci * N_PER_CABLE + pi;
          const { x, y } = initParticlePos[ci][pi];
          const color = PARTICLE_COLORS[pi % PARTICLE_COLORS.length];
          return (
            <circle key={`pd-${ci}-${pi}`}
              ref={el => { pDots.current[flat] = el; }}
              cx={x} cy={y} r={pi === 0 ? 3 : 2}
              fill={color} opacity="0.92" />
          );
        })
      )}
    </svg>
  );
}

// ─── Eye Reveal Modal ─────────────────────────────────────────────────────────
function EyeRevealModal({
  monitor,
  onClose,
}: {
  monitor: typeof MONITORS[0];
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/92" />
      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 p-6 max-w-md w-full mx-4"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full border border-white/20 rounded-sm overflow-hidden">
          <div className="bg-[#0a0a0a] border-b border-white/10 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6E54FF] animate-pulse shadow-[0_0_6px_#6E54FF]" />
              <span className="font-mono text-[10px] text-white/50 tracking-widest">{monitor.id} :: {monitor.sublabel}</span>
            </div>
            <span className="font-mono text-[10px] text-[#6E54FF]/60 tracking-widest">SIGNAL_LOCKED</span>
          </div>
          <div className="relative">
            <motion.img
              src={monitor.image}
              alt={monitor.label}
              className="w-full object-cover"
              style={{ maxHeight: "400px" }}
              initial={{ filter: "brightness(0) contrast(2)" }}
              animate={{ filter: "contrast(1.05) brightness(0.95) saturate(1)" }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 3px)" }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center,transparent 40%,rgba(110,84,255,0.15) 100%)" }} />
          </div>
          <div className="bg-[#0a0a0a] border-t border-white/10 px-4 py-2 flex justify-between items-center">
            <span className="font-mono text-[9px] text-white/30 tracking-widest">{monitor.sublabel} EYE</span>
            <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px" }} className="text-white/40">{monitor.label}</span>
          </div>
        </div>
        <motion.p className="font-mono text-[10px] text-white/30 tracking-[0.3em]"
          animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          [ click anywhere to close ]
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ─── Draggable Monitor ────────────────────────────────────────────────────────
function DraggableMonitor({
  monitor,
  initPos,
  mx,
  my,
  delay,
}: {
  monitor: typeof MONITORS[0];
  initPos: { x: number; y: number };
  mx: ReturnType<typeof useMotionValue>;
  my: ReturnType<typeof useMotionValue>;
  delay: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!clickStart.current) return;
    const dx = Math.abs(e.clientX - clickStart.current.x);
    const dy = Math.abs(e.clientY - clickStart.current.y);
    if (dx > 5 || dy > 5) return; // was a drag, not a click
    if (revealed) {
      setShowModal(true);
    } else {
      setRevealed(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showModal && <EyeRevealModal monitor={monitor} onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        style={{
          x: mx,
          y: my,
          position: "absolute",
          left: initPos.x,
          top: initPos.y,
          width: MON_W,
          cursor: isDragging ? "grabbing" : revealed ? "pointer" : "grab",
          zIndex: isDragging ? 30 : 10,
          touchAction: "none",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onHoverStart={() => { hoveredMonitorRef.current = true; }}
        onHoverEnd={() => { hoveredMonitorRef.current = false; }}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        whileDrag={{ scale: 1.05, zIndex: 30 }}
        data-testid={`monitor-${monitor.id}`}
      >
        {/* Monitor shell (SVG line art) */}
        <svg
          viewBox={`0 0 ${MON_W} ${MON_H + 20}`}
          width={MON_W}
          height={MON_H + 20}
          style={{ display: "block", position: "relative", zIndex: 1 }}
          overflow="visible"
        >
          {/* Casing */}
          <rect x="2" y="2" width={MON_W - 4} height={MON_H - 10} rx="4"
            fill="#0d0d0d"
            stroke={isDragging ? "rgba(110,84,255,0.9)" : "rgba(255,255,255,0.65)"}
            strokeWidth={isDragging ? "2" : "1.5"}
          />
          {/* Screen bezel */}
          <rect x="10" y="9" width={MON_W - 20} height={MON_H - 30} rx="2"
            fill="black" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          {/* Bottom chassis */}
          <rect x="2" y={MON_H - 10} width={MON_W - 4} height="15" rx="2"
            fill="#0d0d0d" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          {/* Stand */}
          <rect x={MON_W / 2 - 18} y={MON_H + 5} width="36" height="8"
            fill="#0d0d0d" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <rect x={MON_W / 2 - 30} y={MON_H + 13} width="60" height="5" rx="2"
            fill="#0d0d0d" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          {/* Power LED */}
          <circle cx="18" cy={MON_H - 2} r="3"
            fill={revealed ? "#6E54FF" : "#2a2a2a"}
            style={revealed ? { filter: "drop-shadow(0 0 5px #6E54FF)" } : undefined} />
          {/* Knobs */}
          <circle cx={MON_W - 28} cy={MON_H - 2} r="3.5"
            fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <circle cx={MON_W - 28} cy={MON_H - 2} r="1.2"
            fill="rgba(255,255,255,0.35)" />
          <circle cx={MON_W - 14} cy={MON_H - 2} r="3.5"
            fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <circle cx={MON_W - 14} cy={MON_H - 2} r="1.2"
            fill="rgba(255,255,255,0.35)" />
          {/* Drag indicator when dragging */}
          {isDragging && (
            <rect x="2" y="2" width={MON_W - 4} height={MON_H - 10} rx="4"
              fill="none" stroke="#6E54FF" strokeWidth="1" opacity="0.4"
              strokeDasharray="6 4"
            />
          )}
          {/* Cable connector port at bottom-center */}
          <rect x={MON_W / 2 - 6} y={MON_H - 11} width="12" height="6" rx="1"
            fill="#0d0d0d" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <circle cx={MON_W / 2} cy={MON_H - 8} r="1.5"
            fill="rgba(110,84,255,0.6)" />
        </svg>

        {/* Screen content */}
        <div
          className="absolute overflow-hidden rounded-sm"
          style={{
            top: 9,
            left: 10,
            width: MON_W - 20,
            height: MON_H - 30,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {/* Idle SVG glitch eye */}
          <AnimatePresence>
            {!revealed && (
              <motion.div
                className="w-full h-full flex items-center justify-center bg-black"
                exit={{ opacity: 0, scale: 1.5, filter: "blur(6px)" }}
                transition={{ duration: 0.35 }}
              >
                <motion.svg
                  viewBox="0 0 120 60"
                  className="w-5/6 h-5/6 fill-none"
                  animate={{
                    scaleY: [1, 0.04, 1, 1, 1, 0.07, 1],
                    filter: [
                      "drop-shadow(0 0 5px #6E54FF)",
                      "drop-shadow(-4px 0 0 #6E54FF) drop-shadow(4px 0 0 #00FFCC)",
                      "drop-shadow(0 0 5px #6E54FF)",
                      "drop-shadow(0 0 5px #6E54FF)",
                      "drop-shadow(0 0 5px #6E54FF)",
                      "drop-shadow(-3px 0 0 #FF0066) drop-shadow(3px 0 0 #6E54FF)",
                      "drop-shadow(0 0 5px #6E54FF)",
                    ],
                  }}
                  transition={{ duration: 5 + monitor.glitchDelay, delay: monitor.glitchDelay, repeat: Infinity }}
                >
                  <path d="M10,30 Q60,2 110,30" stroke="white" strokeWidth="1.5" />
                  <path d="M10,30 Q60,55 110,30" stroke="white" strokeWidth="1.5" />
                  <circle cx="60" cy="30" r="13" stroke="#6E54FF" strokeWidth="1.5" />
                  <circle cx="60" cy="30" r="8" stroke="white" strokeWidth="0.8" strokeDasharray="2 3" />
                  <circle cx="60" cy="30" r="4.5" fill="white" />
                  <circle cx="55" cy="24" r="2" fill="#6E54FF" />
                  {[18, 34, 50, 66, 82, 97].map((cx, k) => (
                    <line key={k} x1={cx} y1={k % 2 === 0 ? 22 : 20} x2={cx - 1} y2={k % 2 === 0 ? 13 : 10}
                      stroke="white" strokeWidth="0.8" />
                  ))}
                </motion.svg>
                <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                  <motion.span
                    className="font-mono text-[7px] text-[#6E54FF]/70 tracking-widest"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    CLICK TO REVEAL
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Revealed eye photo */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <img src={monitor.image} alt={monitor.label}
                  className="w-full h-full object-cover"
                  style={{ filter: "contrast(1.1) brightness(0.9)" }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 1px,transparent 1px,transparent 3px)" }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center,transparent 35%,rgba(110,84,255,0.2) 100%)" }} />
                <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                  <span className="font-mono text-[7px] text-[#6E54FF]/80 bg-black/60 px-2 py-0.5 tracking-widest">
                    EXPAND
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none crt-screen" style={{ zIndex: 3 }} />
        </div>

        {/* Label below */}
        <div className="absolute text-center" style={{ top: MON_H + 20, left: 0, right: 0 }}>
          <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px", letterSpacing: "0.2em" }}
            className="text-white/40">
            {monitor.label}
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── Animated Anime Background ───────────────────────────────────────────────
function AnimeBg() {
  const [flash,  setFlash]  = useState(false);
  const [reveal, setReveal] = useState(false);

  // DOM refs — updated in animation frame, no re-renders on mouse move
  const svgImgRef    = useRef<SVGImageElement | null>(null);
  const turbRef      = useRef<SVGFETurbulenceElement | null>(null);
  const dispRef      = useRef<SVGFEDisplacementMapElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  // Persistent animation state (not React state)
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const dispLerp  = useRef(0);
  const turbTime  = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Occasional glitch-reveal burst
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setFlash(true);
        setTimeout(() => { setFlash(false); schedule(); }, 180);
      }, 3500 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Slow breathing opacity pulse
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const pulse = () => {
      setReveal(true);
      t = setTimeout(() => { setReveal(false); setTimeout(pulse, 5000 + Math.random() * 3000); }, 2000);
    };
    t = setTimeout(pulse, 2000);
    return () => clearTimeout(t);
  }, []);

  // Animation frame: parallax + spotlight + distortion warp (all via DOM, no re-renders)
  useAnimationFrame(() => {
    const { x, y } = mouseRef.current;

    // Parallax: translate SVG image opposite to mouse
    const px = (x - 0.5) * -26;
    const py = (y - 0.5) * -16;
    svgImgRef.current?.setAttribute("transform", `translate(${px} ${py})`);

    // Spotlight gradient follows cursor
    if (spotlightRef.current) {
      spotlightRef.current.style.background =
        `radial-gradient(circle 320px at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(110,84,255,0.1) 0%, rgba(110,84,255,0.03) 45%, transparent 70%)`;
    }

    // Distortion: lerp displacement scale toward target
    const target = hoveredMonitorRef.current ? 65 : 0;
    dispLerp.current += (target - dispLerp.current) * 0.055;

    if (dispRef.current) {
      dispRef.current.setAttribute("scale", dispLerp.current.toFixed(2));
    }

    // Animate turbulence baseFrequency while warp is active (creates ripple motion)
    if (dispLerp.current > 0.5 && turbRef.current) {
      turbTime.current += 0.018;
      const bfX = (0.018 + Math.sin(turbTime.current)       * 0.007).toFixed(4);
      const bfY = (0.026 + Math.cos(turbTime.current * 0.6) * 0.009).toFixed(4);
      turbRef.current.setAttribute("baseFrequency", `${bfX} ${bfY}`);
    }
  });

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

      {/* SVG layer: background image + displacement warp filter */}
      <svg
        className="absolute"
        style={{ left: "-40px", top: "-40px", width: "calc(100% + 80px)", height: "calc(100% + 80px)", overflow: "visible" }}
      >
        <defs>
          <filter id="bgDistort" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            {/* Noise source for displacement */}
            <feTurbulence
              ref={turbRef}
              type="turbulence"
              baseFrequency="0.018 0.026"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            {/* Displacement map — scale starts at 0, lerps up on hover */}
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            {/* Desaturate + blur */}
            <feColorMatrix in="displaced" type="saturate" values="0" result="gray" />
            <feGaussianBlur in="gray" stdDeviation="1.5" />
          </filter>
        </defs>

        <image
          ref={(el) => { svgImgRef.current = el; }}
          href={menuBg}
          x="0" y="0"
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid slice"
          filter="url(#bgDistort)"
          style={{
            opacity: flash ? 0.32 : reveal ? 0.18 : 0.11,
            transition: flash ? "opacity 0.05s" : "opacity 1.8s ease",
          }}
        />
      </svg>

      {/* Purple spotlight div — updated via ref in animation frame */}
      <div ref={spotlightRef} className="absolute inset-0" />

      {/* Ink-wash vignette — keeps image from bleeding to edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(6,6,6,0.65) 75%, rgba(6,6,6,0.92) 100%)",
        }}
      />

      {/* Animated film grain (SVG seed animation) */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.045, mixBlendMode: "overlay" }}>
        <filter id="bgGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch">
            <animate attributeName="seed" from="0" to="200" dur="0.4s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bgGrain)" />
      </svg>

      {/* Glitch horizontal slice on flash burst */}
      {flash && (
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${30 + Math.random() * 40}%`,
            height: "3px",
            background: "rgba(110,84,255,0.5)",
            filter: "blur(1px)",
          }}
        />
      )}
    </div>
  );
}

// ─── Monitor Cluster ──────────────────────────────────────────────────────────
function MonitorCluster() {
  // One pair of motion values per monitor
  const mxArr = MONITORS.map(() => useMotionValue(0));
  const myArr = MONITORS.map(() => useMotionValue(0));

  return (
    <div
      className="relative w-full"
      style={{ height: 420, maxWidth: 680 }}
    >
      <CableLayer mxArr={mxArr} myArr={myArr} />
      {MONITORS.map((mon, i) => (
        <DraggableMonitor
          key={mon.id}
          monitor={mon}
          initPos={INIT_POS[i]}
          mx={mxArr[i]}
          my={myArr[i]}
          delay={0.08 * i}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// ─── Background Audio Hook ────────────────────────────────────────────────────
function useCRTAudio() {
  const ctxRef       = useRef<AudioContext | null>(null);
  const hovGainRef   = useRef<GainNode | null>(null);
  const prevHovered  = useRef(false);
  const readyRef     = useRef(false);

  const boot = useRef(() => {
    if (readyRef.current) return;
    readyRef.current = true;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Master gain — controls overall volume
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    // Hover gain — lerped up/down based on monitor hover
    const hovGain = ctx.createGain();
    hovGain.gain.value = 1;
    hovGain.connect(master);
    hovGainRef.current = hovGain;

    // Wire the WAV file through the AudioContext graph
    const audio = new Audio(geishaSfx);
    audio.loop = true;
    const source = ctx.createMediaElementSource(audio);
    source.connect(hovGain);
    audio.play().catch(() => {});
  });

  // Boot on first user interaction (browser autoplay policy)
  useEffect(() => {
    const start = () => boot.current();
    window.addEventListener("click",      start, { once: true });
    window.addEventListener("touchstart", start, { once: true });
    return () => {
      window.removeEventListener("click",      start);
      window.removeEventListener("touchstart", start);
    };
  }, []);

  // Poll hoveredMonitorRef ~20×/sec — smoothly ramp gain on hover
  useEffect(() => {
    const id = setInterval(() => {
      const ctx     = ctxRef.current;
      const hovGain = hovGainRef.current;
      if (!ctx || !hovGain) return;

      const isHovered = hoveredMonitorRef.current;
      prevHovered.current = isHovered;

      // Idle: 1× · Hover: 1.6× (audio swells when near a monitor)
      const target = isHovered ? 1.6 : 1.0;
      hovGain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);
    }, 50);
    return () => clearInterval(id);
  }, []);
}

export default function MenuPage() {
  const [activeLore, setActiveLore] = useState<number | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  useCRTAudio();

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col relative overflow-x-hidden" data-testid="menu-container">
      {/* ── Animated Anime Background ─────────────────────────────────── */}
      <AnimeBg />

      {/* Grid BG (on top of image, very faint) */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.025]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6E54FF" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Navigation */}
      <header className="w-full px-8 py-5 flex justify-between items-center z-20 relative border-b border-white/5">
        <Link href="/">
          <div style={{ transform: "rotate(-6deg) skewX(-2deg)", display: "inline-block" }}>
            <motion.span
              className="cursor-pointer transition-colors"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem",
                letterSpacing: "0.15em",
                color: "rgba(170,170,170,0.65)",
              }}
              whileHover={{ color: "rgba(110,84,255,0.9)", textShadow: "0 0 20px rgba(110,84,255,0.6)" }}
            >
              HOPZ
            </motion.span>
          </div>
        </Link>
        <nav className="flex gap-8 items-center">
          {[{ en: "Archive", jp: "書庫", href: "/archive" }, { en: "Lore", jp: "伝承", href: "/menu" }, { en: "Mint", jp: "鋳造", href: "/menu" }].map(item => (
            <Link key={item.en} href={item.href}>
              <motion.div className="flex flex-col items-center cursor-pointer group" whileHover={{ y: -2 }}>
                <span className="text-white/25 group-hover:text-[#6E54FF]/60 transition-colors"
                  style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px", letterSpacing: "0.2em" }}>
                  {item.jp}
                </span>
                <span className="font-mono text-[11px] text-white/50 group-hover:text-white tracking-widest transition-colors uppercase">
                  {item.en}
                </span>
                <span className="w-0 h-[1px] bg-[#6E54FF] group-hover:w-full transition-all duration-300 mt-0.5" />
              </motion.div>
            </Link>
          ))}
          <motion.button
            className="ml-4 font-mono text-[11px] tracking-widest border border-[#6E54FF] text-[#6E54FF] px-4 py-1.5 hover:bg-[#6E54FF] hover:text-black transition-all duration-200"
            whileHover={{ boxShadow: "0 0 16px rgba(110,84,255,0.5)" }}
            data-testid="mint-button"
          >
            MINT NOW
          </motion.button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center z-10 px-4 py-6 relative">

        {/* Instruction */}
        <motion.div className="flex flex-col items-center mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-[#6E54FF]/50 tracking-[0.5em] mb-1"
            style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "10px" }}>
            監視端末群 — ドラッグして移動 / クリックして目を解放
          </p>
          <p className="font-mono text-[10px] text-white/20 tracking-widest">
            DRAG MONITORS TO REROUTE THE SIGNAL // CLICK TO REVEAL
          </p>
        </motion.div>

        {/* Draggable monitor cluster with cables */}
        <MonitorCluster />

        {/* Lore Section */}
        <div className="w-full max-w-3xl mt-4 z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="flex-1 h-[1px] bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[#6E54FF]/50 tracking-widest"
                style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px" }}>伝承録</span>
              <span className="font-mono text-[10px] text-white/30 tracking-[0.4em]">LORE DATABASE</span>
            </div>
            <span className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="flex flex-col gap-2">
            {LORE_ENTRIES.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                className="border border-white/20 hover:border-[#6E54FF]/60 transition-colors duration-300 overflow-hidden"
                data-testid={`lore-entry-${entry.id}`}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer group text-left"
                  onClick={() => setActiveLore(activeLore === i ? null : i)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-[#6E54FF]/60 tracking-widest">[{entry.id}]</span>
                    <div className="flex flex-col">
                      <span className="text-[#6E54FF]/70 group-hover:text-[#6E54FF] transition-colors"
                        style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "10px", letterSpacing: "0.15em" }}>
                        {entry.jpTitle}
                      </span>
                      <span className="font-mono text-white tracking-widest" style={{ fontSize: "13px" }}>
                        {entry.enTitle}
                      </span>
                    </div>
                  </div>
                  <motion.span className="font-mono text-[#6E54FF]/50 text-lg"
                    animate={{ rotate: activeLore === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {activeLore === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3">
                        <p className="font-mono text-[12px] text-white/60 leading-relaxed tracking-wide">{entry.text}</p>
                        <p className="text-white/30 leading-relaxed"
                          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "11px", letterSpacing: "0.1em" }}>
                          {entry.jp}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="w-full max-w-3xl mt-6 z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="flex-1 h-[1px] bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[#6E54FF]/50 tracking-widest"
                style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px" }}>主要項目</span>
              <span className="font-mono text-[10px] text-white/30 tracking-[0.4em]">MAIN DIRECTORY</span>
            </div>
            <span className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="flex flex-col gap-0">
            {[
              { en: "EPISODES",        jp: "エピソード",           id: "01", desc: "6 chapters. 6 corrupted souls." },
              { en: "CHARACTER FILES", jp: "キャラクターファイル", id: "02", desc: "Classified dossiers on each entity." },
              { en: "COLLECTION",      jp: "コレクション",         id: "03", desc: "3,333 NFTs. Browse them all." },
              { en: "ROADMAP",         jp: "ロードマップ",         id: "04", desc: "Phase I → Phase IV: The Convergence." },
            ].map((item, i) => (
              <motion.div
                key={item.en}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                className="group cursor-pointer border-b border-white/15 hover:border-[#6E54FF]/60 transition-all duration-300 relative overflow-hidden"
                onMouseEnter={() => setHoveredMenu(item.en)}
                onMouseLeave={() => setHoveredMenu(null)}
                data-testid={`menu-item-${item.id}`}
              >
                <motion.div
                  className="absolute inset-0 bg-[#6E54FF]/5 pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{ x: hoveredMenu === item.en ? "0%" : "-100%" }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative flex items-center justify-between py-4 px-2">
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-[10px] text-white/20 group-hover:text-[#6E54FF]/60 transition-colors tracking-widest">
                      {item.id}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-white/20 group-hover:text-[#6E54FF]/50 transition-colors"
                        style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px", letterSpacing: "0.2em" }}>
                        {item.jp}
                      </span>
                      <span className="text-white group-hover:text-[#6E54FF] transition-colors font-bold tracking-widest"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem" }}>
                        {item.en}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-mono text-[10px] text-white/40 tracking-widest">{item.desc}</span>
                    <span className="font-mono text-[#6E54FF] text-sm">——→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-3 border-t border-white/5 flex justify-between items-center">
        <span className="font-mono text-[9px] text-white/15 tracking-widest">HOPZ_GENESIS / ERC-721 / 3,333 TOKENS</span>
        <span className="text-white/15 tracking-widest"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px" }}>
          ジェネシスコレクション — 目が見ている
        </span>
        <motion.span className="font-mono text-[9px] text-[#6E54FF]/50 tracking-widest"
          animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
          ● SIGNAL ACTIVE
        </motion.span>
      </footer>
    </div>
  );
}

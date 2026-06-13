import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
const heroImage = "/HJZgAQGXAAIwDp1_1781355972231.jfif";

const JAPANESE_CHARS = "ホップズ幻想デジタル魂夢幻界転送存在虚無光闇";

function GlitchOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Purple flash layer */}
          <motion.div
            className="absolute inset-0 bg-[#6E54FF]"
            animate={{ opacity: [0, 0.6, 0, 0.8, 0, 0.4, 0] }}
            transition={{ duration: 0.8, times: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 1] }}
          />
          {/* White scan bars */}
          <motion.div
            className="absolute w-full h-8 bg-white/80"
            style={{ top: "22%" }}
            animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 0.25, delay: 0.1 }}
          />
          <motion.div
            className="absolute w-full h-4 bg-[#6E54FF]/90"
            style={{ top: "55%" }}
            animate={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 0.2, delay: 0.25 }}
          />
          <motion.div
            className="absolute w-full h-12 bg-white/60"
            style={{ bottom: "20%" }}
            animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
          {/* RGB shift stripes */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(110,84,255,0.15) 0px, rgba(110,84,255,0.15) 2px, transparent 2px, transparent 6px)",
            }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.8 }}
          />
          {/* Japanese kanji rain */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-[#6E54FF] font-bold select-none"
                style={{
                  left: `${(i / 12) * 100}%`,
                  top: `${Math.random() * 80}%`,
                  fontSize: `${16 + Math.random() * 24}px`,
                  fontFamily: "'Noto Serif JP', serif",
                  opacity: 0,
                }}
                animate={{ opacity: [0, 1, 0], y: [0, 30] }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              >
                {JAPANESE_CHARS[i % JAPANESE_CHARS.length]}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function SplashPage() {
  const [, setLocation] = useLocation();
  const [isGlitching, setIsGlitching] = useState(false);
  const [randChars, setRandChars] = useState<string[]>([]);

  useEffect(() => {
    const chars = Array.from({ length: 8 }, (_, i) => JAPANESE_CHARS[i]);
    setRandChars(chars);
  }, []);

  const handleEnter = () => {
    if (isGlitching) return;
    setIsGlitching(true);
    setTimeout(() => setLocation("/menu"), 850);
  };

  return (
    <div
      className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden cursor-pointer select-none"
      onClick={handleEnter}
      data-testid="splash-container"
    >
      <GlitchOverlay active={isGlitching} />

      {/* Full-bleed hero image with black & white filter */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="HOPZ NFT Hero"
          className="w-full h-full object-cover"
          style={{
            filter: "grayscale(100%) contrast(1.2) brightness(0.55)",
          }}
        />
        {/* Dark vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.95) 100%)",
          }}
        />
        {/* Purple tint overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(110,84,255,0.08) 0%, transparent 50%, rgba(110,84,255,0.12) 100%)",
          }}
        />
      </div>

      {/* Minimalist purple scan lines */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-[28%] left-0 w-full h-[1px] bg-[#6E54FF]/25 transform -skew-y-6" />
        <div className="absolute top-[72%] left-0 w-full h-[1px] bg-[#6E54FF]/20 transform skew-y-3" />
        <div className="absolute top-0 left-[22%] w-[1px] h-full bg-[#6E54FF]/15" />
        <div className="absolute top-0 right-[22%] w-[1px] h-full bg-[#6E54FF]/15" />
      </div>

      {/* Vertical Japanese kanji strip — left side */}
      <div
        className="absolute left-8 top-0 h-full z-20 flex flex-col justify-center gap-4 pointer-events-none"
        style={{ writingMode: "vertical-rl" }}
      >
        <motion.div
          className="text-white/20 tracking-widest"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "11px", letterSpacing: "0.4em" }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          非代替トークン
        </motion.div>
        <motion.div
          className="text-[#6E54FF]/40 tracking-widest"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "10px", letterSpacing: "0.3em" }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        >
          コレクション
        </motion.div>
      </div>

      {/* Vertical Japanese kanji strip — right side */}
      <div
        className="absolute right-8 top-0 h-full z-20 flex flex-col justify-center gap-4 pointer-events-none"
        style={{ writingMode: "vertical-rl" }}
      >
        <motion.div
          className="text-white/20 tracking-widest"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "11px", letterSpacing: "0.4em" }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        >
          デジタル幻想
        </motion.div>
        <motion.div
          className="text-[#6E54FF]/40 tracking-widest"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "10px", letterSpacing: "0.3em" }}
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        >
          魂の証明
        </motion.div>
      </div>

      {/* Center content */}
      <div className="relative z-30 flex flex-col items-center gap-0">
        {/* Top label */}
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="w-8 h-[1px] bg-[#6E54FF]" />
          <span
            className="text-[#6E54FF]/80 font-mono text-[10px] tracking-[0.4em] uppercase"
          >
            NFT Collection 2025
          </span>
          <span className="w-8 h-[1px] bg-[#6E54FF]" />
        </motion.div>

        {/* Japanese subtitle above HOPZ */}
        <motion.p
          className="mb-1 text-white/50 tracking-[0.5em] text-center"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "13px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          ホップズ — 幻想デジタル界
        </motion.p>

        {/* HOPZ logo */}
        <div style={{ transform: "rotate(-5deg) skewX(-2deg)", display: "inline-block" }}>
          <motion.h1
            className="font-bold text-center leading-none glitch-text-idle"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(6rem, 18vw, 14rem)",
              letterSpacing: "-0.02em",
              color: "rgba(180,180,180,0.7)",
              textShadow: "0 0 60px rgba(110,84,255,0.18), 0 2px 40px rgba(0,0,0,0.9)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              isGlitching
                ? {
                    x: [-8, 8, -4, 4, 0],
                    filter: [
                      "drop-shadow(6px 0 0 #6E54FF) drop-shadow(-6px 0 0 #00ffff)",
                      "drop-shadow(-6px 0 0 #6E54FF) drop-shadow(6px 0 0 #00ffcc)",
                      "none",
                    ],
                  }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: isGlitching ? 0.8 : 0.9, delay: isGlitching ? 0 : 0.2 }}
            data-testid="splash-title"
          >
            HOPZ
          </motion.h1>
        </div>

        {/* Japanese tagline below */}
        <motion.p
          className="mt-2 text-white/40 tracking-[0.3em] text-center"
          style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "12px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          存在を証明せよ
        </motion.p>

        {/* NFT stats row */}
        <motion.div
          className="mt-8 flex items-center gap-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-white/30 tracking-widest">SUPPLY</span>
            <span className="font-mono text-white/70 text-sm tracking-widest">3,333</span>
          </div>
          <span className="w-[1px] h-8 bg-[#6E54FF]/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-white/30 tracking-widest">CHAIN</span>
            <span className="font-mono text-white/70 text-sm tracking-widest">ETH</span>
          </div>
          <span className="w-[1px] h-8 bg-[#6E54FF]/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-white/30 tracking-widest">MINT</span>
            <span className="font-mono text-[#6E54FF] text-sm tracking-widest">LIVE</span>
          </div>
        </motion.div>

        {/* Click to Enter */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.p
            className="font-mono text-[11px] tracking-[0.5em] text-[#6E54FF] uppercase"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            [ Click to Enter ]
          </motion.p>
          <motion.p
            className="text-white/25 tracking-[0.3em]"
            style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px" }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            クリックして入る
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom left — collection ID */}
      <motion.div
        className="absolute bottom-6 left-8 z-20 font-mono text-[9px] text-white/20 tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        HOPZ_GENESIS / #0001 — #3333
      </motion.div>

      {/* Bottom right — japanese */}
      <motion.div
        className="absolute bottom-6 right-8 z-20 text-white/20 tracking-widest text-right"
        style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        ジェネシスコレクション
      </motion.div>

      {/* Scanline sweep */}
      <div className="scanline-effect" />
    </div>
  );
}

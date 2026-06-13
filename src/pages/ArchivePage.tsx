import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import eye1 from "@assets/2ae7f8c83a39b07b98af621d7d10a235_1781356817933.jpg";
import eye2 from "@assets/4667a51274dabb41dbcc2ab3db3ba6de_1781356371898.jpg";
import eye3 from "@assets/fc5b18481973e1979078359605e9506f_1781356371898.jpg";
import eye4 from "@assets/272723742c11fba2d41a831dee177fbc_1781356817932.jpg";
import eye5 from "@assets/ae5781de1d00a09072b464acb5691625_1781356817933.jpg";

// ─── NFT Data ────────────────────────────────────────────────────────────────
type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";

interface Trait {
  traitType: string;
  traitJp: string;
  value: string;
  valueJp: string;
  rarity: number; // % of collection with this trait
}

interface NFT {
  id: number;
  image: string;
  rarity: Rarity;
  rank: number;
  traits: Trait[];
}

const IMAGES = [eye1, eye2, eye3, eye4, eye5];

const RARITY_COLOR: Record<Rarity, string> = {
  COMMON:    "rgba(255,255,255,0.3)",
  UNCOMMON:  "rgba(110,220,110,0.7)",
  RARE:      "rgba(80,160,255,0.8)",
  LEGENDARY: "rgba(110,84,255,0.95)",
};

const RARITY_GLOW: Record<Rarity, string> = {
  COMMON:    "0 0 0px transparent",
  UNCOMMON:  "0 0 14px rgba(110,220,110,0.25)",
  RARE:      "0 0 18px rgba(80,160,255,0.3)",
  LEGENDARY: "0 0 28px rgba(110,84,255,0.5)",
};

const RAW: Array<Omit<NFT, "id">> = [
  {
    image: eye1, rarity: "LEGENDARY", rank: 7,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Signal Void",    valueJp: "信号無効",   rarity: 1.2 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Cursed Oracle",  valueJp: "呪われた神託", rarity: 0.8 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Cosmic Pulse",   valueJp: "宇宙の鼓動", rarity: 2.1 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "MAX",            valueJp: "最大",       rarity: 1.5 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Bleeding",       valueJp: "出血",       rarity: 3.0 },
    ],
  },
  {
    image: eye3, rarity: "LEGENDARY", rank: 19,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Crimson Static", valueJp: "赤い静電気", rarity: 1.8 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Ancient Glyph",  valueJp: "古代の象形", rarity: 1.0 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Dark Signal",    valueJp: "暗号信号",   rarity: 2.5 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "100%",           valueJp: "百%",       rarity: 4.2 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Fractured",      valueJp: "破砕",       rarity: 2.8 },
    ],
  },
  {
    image: eye5, rarity: "RARE", rank: 88,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Digital Rain",   valueJp: "電子の雨",   rarity: 5.3 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Neon Specter",   valueJp: "蛍光霊体",   rarity: 4.1 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Glitch Storm",   valueJp: "障害嵐",     rarity: 6.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "66%",            valueJp: "六十六%",   rarity: 8.4 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Static",         valueJp: "静電気",     rarity: 7.2 },
    ],
  },
  {
    image: eye2, rarity: "RARE", rank: 143,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "White Noise",    valueJp: "白色雑音",   rarity: 7.8 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Mechanical",     valueJp: "機械式",     rarity: 5.5 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Purple Haze",    valueJp: "紫の霞",     rarity: 9.1 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "33%",            valueJp: "三十三%",   rarity: 12.3 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Half-Open",      valueJp: "半開き",     rarity: 11.0 },
    ],
  },
  {
    image: eye4, rarity: "RARE", rank: 251,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Signal Decay",   valueJp: "信号減衰",   rarity: 8.9 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Spectral",       valueJp: "スペクトル", rarity: 6.4 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Neon Leak",      valueJp: "蛍光漏れ",   rarity: 7.7 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "66%",            valueJp: "六十六%",   rarity: 8.4 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Wired Shut",     valueJp: "配線閉鎖",   rarity: 5.8 },
    ],
  },
  {
    image: eye1, rarity: "UNCOMMON", rank: 512,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Static Gray",    valueJp: "静的灰色",   rarity: 14.2 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Hollow",         valueJp: "虚ろ",       rarity: 11.3 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Cold Mist",      valueJp: "冷たい霧",   rarity: 13.5 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "33%",            valueJp: "三十三%",   rarity: 12.3 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Open Wide",      valueJp: "大きく開く", rarity: 15.0 },
    ],
  },
  {
    image: eye3, rarity: "UNCOMMON", rank: 704,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Dark Void",      valueJp: "暗黒の虚無", rarity: 16.8 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Glass Orb",      valueJp: "硝子の球",   rarity: 13.9 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Pulse",          valueJp: "鼓動",       rarity: 18.2 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Veined",         valueJp: "静脈入り",   rarity: 14.7 },
    ],
  },
  {
    image: eye5, rarity: "UNCOMMON", rank: 999,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Charcoal",       valueJp: "炭",         rarity: 19.4 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Watching",       valueJp: "監視中",     rarity: 17.0 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Flicker",        valueJp: "明滅",       rarity: 20.3 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Half-Open",      valueJp: "半開き",     rarity: 11.0 },
    ],
  },
  {
    image: eye2, rarity: "UNCOMMON", rank: 1388,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Fog",            valueJp: "霧",         rarity: 21.0 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Feline",         valueJp: "猫の目",     rarity: 18.5 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "None",           valueJp: "なし",       rarity: 32.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "33%",            valueJp: "三十三%",   rarity: 12.3 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Drooping",       valueJp: "垂れ下がり", rarity: 16.5 },
    ],
  },
  {
    image: eye4, rarity: "UNCOMMON", rank: 1750,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Ash",            valueJp: "灰",         rarity: 24.3 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Teardrop",       valueJp: "涙形",       rarity: 19.2 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "Dim",            valueJp: "薄暗い",     rarity: 25.7 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Open Wide",      valueJp: "大きく開く", rarity: 15.0 },
    ],
  },
  {
    image: eye1, rarity: "COMMON", rank: 2044,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Black",          valueJp: "黒",         rarity: 38.5 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Standard",       valueJp: "標準",       rarity: 40.2 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "None",           valueJp: "なし",       rarity: 32.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Closed",         valueJp: "閉じた",     rarity: 35.0 },
    ],
  },
  {
    image: eye3, rarity: "COMMON", rank: 2290,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Black",          valueJp: "黒",         rarity: 38.5 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Standard",       valueJp: "標準",       rarity: 40.2 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "None",           valueJp: "なし",       rarity: 32.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Blinking",       valueJp: "瞬き中",     rarity: 28.4 },
    ],
  },
  {
    image: eye5, rarity: "COMMON", rank: 2711,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Charcoal",       valueJp: "炭",         rarity: 19.4 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Standard",       valueJp: "標準",       rarity: 40.2 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "None",           valueJp: "なし",       rarity: 32.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Heavy",          valueJp: "重い",       rarity: 30.1 },
    ],
  },
  {
    image: eye2, rarity: "COMMON", rank: 2988,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Black",          valueJp: "黒",         rarity: 38.5 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Narrow",         valueJp: "細い",       rarity: 29.8 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "None",           valueJp: "なし",       rarity: 32.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Closed",         valueJp: "閉じた",     rarity: 35.0 },
    ],
  },
  {
    image: eye4, rarity: "COMMON", rank: 3201,
    traits: [
      { traitType: "Background", traitJp: "背景",      value: "Black",          valueJp: "黒",         rarity: 38.5 },
      { traitType: "Eye Type",   traitJp: "目の種類",  value: "Standard",       valueJp: "標準",       rarity: 40.2 },
      { traitType: "Aura",       traitJp: "オーラ",    value: "None",           valueJp: "なし",       rarity: 32.0 },
      { traitType: "Corruption", traitJp: "腐敗",      value: "0%",             valueJp: "零%",       rarity: 22.1 },
      { traitType: "Eyelid",     traitJp: "まぶた",    value: "Open Wide",      valueJp: "大きく開く", rarity: 15.0 },
    ],
  },
];

const NFTS: NFT[] = RAW.map((n, i) => ({ ...n, id: i + 1 }));

const FILTERS: Array<{ label: string; jp: string; value: Rarity | "ALL" }> = [
  { label: "ALL",       jp: "全て",     value: "ALL" },
  { label: "LEGENDARY", jp: "伝説",     value: "LEGENDARY" },
  { label: "RARE",      jp: "希少",     value: "RARE" },
  { label: "UNCOMMON",  jp: "非凡",     value: "UNCOMMON" },
  { label: "COMMON",    jp: "普通",     value: "COMMON" },
];

// ─── NFT Card ─────────────────────────────────────────────────────────────────
function NFTCard({ nft, onClick }: { nft: NFT; onClick: () => void }) {
  const col = RARITY_COLOR[nft.rarity];
  const glow = RARITY_GLOW[nft.rarity];
  return (
    <motion.div
      className="relative cursor-pointer group overflow-hidden"
      style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}
      whileHover={{ borderColor: col, boxShadow: glow, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      layout
    >
      {/* Image + scanlines */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={nft.image}
          alt={`HOPZ #${String(nft.id).padStart(4, "0")}`}
          className="w-full h-full object-cover"
          style={{
            filter: "grayscale(85%) contrast(1.15) brightness(0.85)",
            mixBlendMode: "luminosity",
            transition: "filter 0.3s",
          }}
        />
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* Hover: purple tint */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "rgba(110,84,255,0)" }}
          whileHover={{ background: "rgba(110,84,255,0.08)" }}
        />
        {/* Token ID badge */}
        <div className="absolute top-2 left-2 font-mono text-[9px] tracking-widest text-white/40 bg-black/60 px-1.5 py-0.5">
          #{String(nft.id).padStart(4, "0")}
        </div>
        {/* Rarity badge */}
        <div
          className="absolute top-2 right-2 font-mono text-[8px] tracking-widest px-1.5 py-0.5"
          style={{ color: col, border: `1px solid ${col}`, background: "rgba(0,0,0,0.7)" }}
        >
          {nft.rarity}
        </div>
      </div>

      {/* Footer strip */}
      <div className="px-3 py-2 flex justify-between items-center border-t border-white/5">
        <div className="flex flex-col">
          <span className="text-white/25 tracking-widest" style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "8px" }}>ホップズ</span>
          <span className="font-mono text-[11px] text-white/55 tracking-widest">HOPZ #{String(nft.id).padStart(4, "0")}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white/25 tracking-wider" style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "7px" }}>希少度</span>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: col }}>#{nft.rank}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── NFT Modal ────────────────────────────────────────────────────────────────
function NFTModal({ nft, onClose }: { nft: NFT; onClose: () => void }) {
  const col = RARITY_COLOR[nft.rarity];
  const glow = RARITY_GLOW[nft.rarity];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 w-full max-w-2xl overflow-hidden"
        style={{
          background: "#080808",
          border: `1px solid ${col}`,
          boxShadow: `${glow}, inset 0 0 60px rgba(0,0,0,0.8)`,
        }}
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8"
          style={{ borderColor: `${col}22` }}>
          <div className="flex flex-col">
            <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px", color: `${col}99`, letterSpacing: "0.3em" }}>
              ホップズ · 記録書庫
            </span>
            <span className="font-mono text-white/70 tracking-[0.3em]" style={{ fontSize: "11px" }}>
              HOPZ #{String(nft.id).padStart(4, "0")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[9px] tracking-widest px-2 py-0.5"
              style={{ color: col, border: `1px solid ${col}` }}
            >
              {nft.rarity}
            </span>
            <button
              className="font-mono text-white/30 hover:text-white/80 transition-colors text-xs tracking-widest"
              onClick={onClose}
            >
              [CLOSE]
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: image */}
          <div className="relative md:w-64 shrink-0 overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
            <img
              src={nft.image}
              alt={`HOPZ #${String(nft.id).padStart(4, "0")}`}
              className="w-full h-full object-cover"
              style={{ filter: "grayscale(60%) contrast(1.2) brightness(0.9)" }}
            />
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
              }}
            />
            {/* Rank badge */}
            <div className="absolute bottom-3 left-3">
              <div className="font-mono text-[9px] tracking-widest bg-black/70 px-2 py-1" style={{ color: col }}>
                RANK &nbsp;#{nft.rank} / 3333
              </div>
            </div>
          </div>

          {/* Right: traits + mint */}
          <div className="flex-1 flex flex-col p-5">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] flex-1 bg-white/8" style={{ background: `${col}22` }} />
              <span className="font-mono text-[9px] tracking-[0.4em] text-white/25">ATTRIBUTES</span>
              <span className="h-[1px] flex-1 bg-white/8" style={{ background: `${col}22` }} />
            </div>

            {/* Traits table */}
            <div className="flex flex-col gap-2 flex-1">
              {nft.traits.map((t) => (
                <div key={t.traitType} className="flex items-center justify-between py-1.5 px-2"
                  style={{ background: "rgba(255,255,255,0.025)", borderLeft: `2px solid ${col}33` }}>
                  <div className="flex flex-col">
                    <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>
                      {t.traitJp}
                    </span>
                    <span className="font-mono text-white/50 tracking-wider" style={{ fontSize: "10px" }}>
                      {t.traitType}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono tracking-wide" style={{ fontSize: "11px", color: col }}>
                      {t.value}
                    </span>
                    <span className="font-mono text-white/25 tracking-wider" style={{ fontSize: "9px" }}>
                      {t.rarity}% have this
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mint button */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between font-mono text-[9px] text-white/20 tracking-widest">
                <span>SUPPLY: 3,333</span>
                <span>CHAIN: ETH</span>
              </div>
              <motion.button
                className="w-full font-mono tracking-[0.4em] py-3 text-sm relative overflow-hidden"
                style={{
                  background: "transparent",
                  border: `1px solid ${col}`,
                  color: col,
                }}
                whileHover={{
                  background: col,
                  color: "#000",
                  boxShadow: `0 0 30px ${col}88`,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                MINT NOW
                <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "9px", display: "block", marginTop: "2px", opacity: 0.6 }}>
                  今すぐ鋳造
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom: CRT noise strip */}
        <div className="h-1 w-full relative overflow-hidden" style={{ background: "#060606" }}>
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${col} 50%, transparent 100%)` }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Archive Page ─────────────────────────────────────────────────────────────
export default function ArchivePage() {
  const [filter,    setFilter]    = useState<Rarity | "ALL">("ALL");
  const [selected,  setSelected]  = useState<NFT | null>(null);

  const visible = filter === "ALL" ? NFTS : NFTS.filter(n => n.rarity === filter);

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col relative overflow-x-hidden">

      {/* Grid BG */}
      <div className="absolute inset-0 pointer-events-none z-[0] opacity-[0.02]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6E54FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scanline overlay (page-wide) */}
      <div
        className="absolute inset-0 pointer-events-none z-[0]"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 4px)",
        }}
      />

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
          {[
            { en: "Archive", jp: "書庫",  href: "/archive" },
            { en: "Lore",    jp: "伝承",  href: "/menu" },
            { en: "Mint",    jp: "鋳造",  href: "/menu" },
          ].map(item => (
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
          >
            MINT NOW
          </motion.button>
        </nav>
      </header>

      {/* Page header */}
      <div className="z-10 relative px-8 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <span className="text-[#6E54FF]/40 tracking-[0.5em] mb-1"
            style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "10px" }}>
            目のアーカイブ — 3,333の監視眼
          </span>
          <div className="flex items-end gap-4">
            <h1
              className="text-white/80 tracking-[0.2em]"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.6rem", lineHeight: 1 }}
            >
              EYE ARCHIVE
            </h1>
            <span className="font-mono text-white/20 text-xs tracking-widest mb-1">3,333 TOKENS · ETH</span>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          className="flex gap-2 mt-5 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {FILTERS.map(f => {
            const active = filter === f.value;
            const rarityCol = f.value !== "ALL" ? RARITY_COLOR[f.value as Rarity] : "rgba(255,255,255,0.8)";
            return (
              <button
                key={f.value}
                className="flex flex-col items-center px-3 py-1.5 transition-all"
                style={{
                  fontFamily: "monospace",
                  fontSize: "10px",
                  letterSpacing: "0.3em",
                  border: active ? `1px solid ${rarityCol}` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? rarityCol : "rgba(255,255,255,0.3)",
                  background: active ? `${rarityCol}11` : "transparent",
                  boxShadow: active && f.value !== "ALL" ? RARITY_GLOW[f.value as Rarity] : "none",
                }}
                onClick={() => setFilter(f.value)}
              >
                <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "8px", opacity: 0.6 }}>{f.jp}</span>
                {f.label}
              </button>
            );
          })}
          <span className="ml-auto self-end font-mono text-[10px] text-white/20 tracking-widest">
            {visible.length} RESULTS
          </span>
        </motion.div>
      </div>

      {/* NFT Grid */}
      <main className="flex-1 z-10 relative px-8 pb-12">
        <motion.div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
          layout
        >
          <AnimatePresence mode="popLayout">
            {visible.map((nft, i) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                layout
              >
                <NFTCard nft={nft} onClick={() => setSelected(nft)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <NFTModal nft={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

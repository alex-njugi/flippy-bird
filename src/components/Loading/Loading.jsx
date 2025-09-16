import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Small inline bird logo used in loader (faces right) */
function LoaderBird({ size = 56, rotate = 0 }) {
  return (
    <svg width={size} height={(size * 44) / 56} viewBox="0 0 56 44" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
      <defs>
        <linearGradient id="lb" x1="0" x2="1">
          <stop offset="0" stopColor="#00d2ff"/>
          <stop offset="1" stopColor="#7b61ff"/>
        </linearGradient>
      </defs>
      <g transform={`translate(56 0) scale(-1 1) rotate(${rotate} 28 22)`}>
        <g transform="translate(6,6)">
          <ellipse cx="18" cy="12" rx="18" ry="12" fill="url(#lb)"/>
          <path d="M34 18 L42 10 L40 22 Z" fill="url(#lb)" opacity="0.95"/>
          <path d="M2 14 L10 12 L10 16 Z" fill="#ffca66" />
          <circle cx="24" cy="10" r="3" fill="#fff" />
          <circle cx="25" cy="9.4" r="1.1" fill="#07202a" />
        </g>
      </g>
    </svg>
  );
}

/* Loader component */
export default function Loading({ onComplete }) {
  const [pct, setPct] = useState(0);
  const tips = [
    "Tap to flap — timing is everything.",
    "Try to keep your rhythm steady.",
    "Small flaps > big panics.",
    "Play short runs, flex big scores."
  ];
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // progress animation: ease to 100 in ~1100ms, then small pause
    let start = performance.now();
    let raf = null;
    function frame(t) {
      const elapsed = t - start;
      // ease percentage with an easeOutCubic curve
      const duration = 1100;
      const x = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - x, 3);
      setPct(Math.round(eased * 100));
      if (x < 1) raf = requestAnimationFrame(frame);
      else {
        // hold a moment and finish
        setTimeout(() => {
          setPct(100);
          onComplete && onComplete();
        }, 220);
      }
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  useEffect(() => {
    const id = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="loader-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <motion.div
              initial={{ scale: 0.86, rotate: -6 }}
              animate={{ scale: [0.96, 1.02, 0.98], rotate: [-6, 6, -3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 86, height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <LoaderBird size={86} />
            </motion.div>
          </div>

          <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 6 }}>Flippy</div>
          <div style={{ opacity: 0.78, marginBottom: 18 }}>Tap • Dodge • Flex — quick runs, big brag</div>

          <div style={{ marginBottom: 12 }}>
            <div className="progress-track" aria-hidden>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, opacity: 0.8 }}>
              <div>Loading</div>
              <div>{pct}%</div>
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>{tips[tipIndex]}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

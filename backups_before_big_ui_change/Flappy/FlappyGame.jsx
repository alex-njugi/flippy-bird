import React, { useRef, useEffect, useState } from "react";
import useFlappyLoop from "../../hooks/useFlappyLoop";
import { useAudio } from "../../lib/audio";
import { motion, AnimatePresence } from "framer-motion";

/* -- BirdSVG: flipped horizontally so it faces RIGHT -- */
function BirdSVG({ rotate = 0, width = 56, height = 44 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 56 44" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
      <defs>
        <linearGradient id="bodyGrad2" x1="0" x2="1">
          <stop offset="0" stopColor="#00d2ff" />
          <stop offset="1" stopColor="#7b61ff" />
        </linearGradient>
        <filter id="drop2" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.35"/>
        </filter>
      </defs>

      {/* To flip horizontally while keeping the pivot, we apply scale(-1,1) and translate */}
      <g transform={`translate(56 0) scale(-1 1) rotate(${rotate} 28 22)`}>
        <g transform="translate(6,6)">
          <ellipse cx="18" cy="12" rx="18" ry="12" fill="url(#bodyGrad2)" filter="url(#drop2)"/>
          <ellipse cx="14" cy="14" rx="9" ry="5" fill="rgba(255,255,255,0.12)" />
          <path d="M34 18 L42 10 L40 22 Z" fill="url(#bodyGrad2)" opacity="0.95"/>
          <path d="M2 14 L10 12 L10 16 Z" fill="#ffca66" />
          <circle cx="24" cy="10" r="3" fill="#fff" />
          <circle cx="25" cy="9.4" r="1.1" fill="#07202a" />
        </g>

        <g transform="translate(6,6)" style={{transformOrigin:"24px 12px"}}>
          <path className="wing" d="M22 6 C30 2, 40 6, 36 14 C32 22, 20 22, 18 16 Z" fill="#7b61ff" opacity="0.96"/>
          <path className="wing-shade" d="M24 10 C32 6, 38 8, 35 13 C32 18, 24 16, 22 12 Z" fill="rgba(0,0,0,0.06)"/>
        </g>
      </g>

      <style>{`
        .wing { transform-origin: 24px 12px; animation: flap 0.45s ease-in-out infinite; }
        .wing-shade { transform-origin: 24px 12px; animation: flap 0.45s ease-in-out infinite; animation-delay: 0.03s; }
        @keyframes flap {
          0% { transform: rotate(-6deg) translateY(0px); }
          50% { transform: rotate(16deg) translateY(-4px); }
          100% { transform: rotate(-6deg) translateY(0px); }
        }
      `}</style>
    </svg>
  );
}

export default function FlappyGame(){
  const containerRef = useRef(null);
  const { running, start, flap, bird, pipes, score, best, setRunning } = useFlappyLoop(containerRef);
  const { playSfx, startLoop, stopLoop, resume } = useAudio();
  const [showOver, setShowOver] = useState(false);

  useEffect(()=> {
    if (running) { startLoop(); } else stopLoop();
  },[running]);

  useEffect(()=> {
    if (!running && score > 0) {
      playSfx("hit");
      setShowOver(true);
      setTimeout(()=> setShowOver(false), 1400);
    }
  }, [running]);

  // Unified input handler that works for pointer, touch, and click
  function handleInputStart(e){
    // prevent page scroll on touch devices
    if (e && e.preventDefault) e.preventDefault();
    if (!running) {
      resume();
      start();
      if(navigator?.vibrate)navigator.vibrate(12); playSfx("flap");
      return;
    }
    flap();
    if(navigator?.vibrate)navigator.vibrate(12); playSfx("flap");
  }

  // compute rotation: invert sign because we flipped horizontally
  const rotation = Math.max(-45, Math.min(60, -(bird.vy / 700) * 40));

  return (
    <div>
      <div className="hud">
        <div style={{display:"flex", flexDirection:"column"}}>
          <div style={{fontSize:12, opacity:0.8}}>Score</div>
          <div style={{fontWeight:900, fontSize:22}}>{Math.floor(score)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12, opacity:0.8}}>Best</div>
          <div style={{fontWeight:800}}>{best}</div>
        </div>
      </div>

      {/* Stage: touch-action:none prevents scrolling; we listen to pointerdown for best cross-device support */}
      <div
        ref={containerRef}
        className="stage"
        onClick={handleInputStart}
        onTouchStart={(e)=> { /* prevent default to avoid overscroll */ e.preventDefault(); handleInputStart(e); }}
        onPointerDown={(e)=> { /* pointer events unify mouse/touch/pen */ e.preventDefault(); handleInputStart(e); }}
        role="button"
        tabIndex={0}
      >
        {/* pipes */}
        {pipes.map(p=> {
          const x = p.x*100;
          const w = 76;
          const topH = p.center - p.gap/2;
          const bottomY = p.center + p.gap/2;
          return (
            <React.Fragment key={p.id}>
              <div className="pipe" style={{ left: `${x}%`, top: 0, height: `${topH}px`, width: `${w}px`, transform: `translateX(-50%)` }} />
              <div className="pipe" style={{ left: `${x}%`, top: `${bottomY}px`, height: `calc(100% - ${bottomY}px)`, width: `${w}px`, transform: `translateX(-50%)` }} />
            </React.Fragment>
          );
        })}

        {/* bird: positioned at a comfortable left fraction */}
        <motion.div
          style={{
            position: "absolute",
            left: `${36}%`,
            top: `${bird.y*100}%`,
            transform: "translate(-50%,-50%)",
            width: 56,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 700, damping: 24, mass: 0.28 }}
        >
          <BirdSVG rotate={rotation} width={56} height={44} />
        </motion.div>

        {/* start overlay */}
        <AnimatePresence>
        {!running && score === 0 && (
          <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} key="start">
            <div className="modal">
              <div style={{fontSize:22, fontWeight:900}}>Flippy</div>
              <div style={{opacity:0.8, marginTop:6, marginBottom:14}}>Tap to flap • Classic feel, fresh style</div>
              <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                <button className="play-btn" onClick={()=> { start(); if(navigator?.vibrate)navigator.vibrate(12); playSfx("flap"); resume(); }}>Play</button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>

        {/* game over overlay */}
        <AnimatePresence>
        {showOver && (
          <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} key="over">
            <div className="modal">
              <div style={{fontSize:20, fontWeight:900}}>Game Over</div>
              <div style={{marginTop:8, marginBottom:12}}>Score: <span style={{fontWeight:800}}>{Math.round(score)}</span></div>
              <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                <button className="play-btn" onClick={()=> { start(); }}>Retry</button>
                <button className="small-btn" onClick={()=> { setRunning(false); }}>Menu</button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
      </div>
    </div>
  );
}

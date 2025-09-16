import React, { useRef, useEffect, useState } from "react";
import useGameLoop from "../../hooks/useGameLoop";
import { DEFAULT_SKINS } from "../../services/shop";
import { useAudio } from "../../lib/audio";
import { motion, AnimatePresence } from "framer-motion";

export default function Game({ onExit, onEarn }) {
  const containerRef = useRef(null);
  const { running, start, score, playerX, setPlayerXPercent, playerSize, obstacles, powerUps, usePowerUp, resetPowerUps } = useGameLoop(containerRef);
  const [skin, setSkin] = useState("neon-1");
  const [best] = useState(localStorage.getItem("dd_best") || 0);
  const { playSfx, startLoop, stopLoop, resumeAudio } = useAudio();

  useEffect(()=> {
    if (running) { startLoop(); playSfx("start"); }
    else stopLoop();
  }, [running]);

  // handle start
  function handleStart(){
    resumeAudio();
    start();
  }

  return (
    <div style={{padding:12}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
        <div style={{fontSize:12, opacity:0.8}}>Score</div>
        <div style={{fontWeight:800, fontSize:18}}>{Math.floor(score)}</div>
        <div style={{fontSize:12, opacity:0.8}}>Best <span style={{fontWeight:700, marginLeft:6}}>{best}</span></div>
      </div>

      <div ref={containerRef} className="playfield"
           onMouseMove={(e)=> {
             const rect = containerRef.current.getBoundingClientRect();
             setPlayerXPercent((e.clientX - rect.left) / rect.width);
           }}
           onTouchMove={(e)=> {
             if (!e.touches.length) return;
             const rect = containerRef.current.getBoundingClientRect();
             setPlayerXPercent((e.touches[0].clientX - rect.left) / rect.width);
           }}
      >
        {/* obstacles */}
        {obstacles.map((o, i) => (
          <motion.div
            key={o.id}
            className="obstacle"
            style={{
              left: `${o.x*100}%`,
              top: `${o.y*100}%`,
              width: o.size,
              height: o.size,
              position: "absolute",
              transform: "translate(-50%,-50%)",
              background: `linear-gradient(180deg, ${getColor(i)}, ${getColor(i,true)})`,
              borderRadius: 12
            }}
            animate={{ rotate: (o.y*360)%360 }}
            transition={{ ease: "linear", duration: 0.8 }}
            />
        ))}

        {/* player */}
        <motion.div
          className="player"
          style={{
            position: "absolute",
            left: `${playerX*100}%`,
            bottom: 18,
            width: playerSize,
            height: playerSize,
            transform: "translateX(-50%)",
            background: `linear-gradient(90deg, ${DEFAULT_SKINS.find(s=>s.id===skin)?.colors[0]}, ${DEFAULT_SKINS.find(s=>s.id===skin)?.colors[1]})`
          }}
          animate={{ boxShadow: "0 18px 48px rgba(123,97,255,0.18)" }}
          transition={{ duration: 0.18 }}
        />

        {/* overlays */}
        <AnimatePresence>
          {!running && (
            <motion.div className="start-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.28}}>
              <div className="modal">
                <div style={{fontSize:22, fontWeight:900, marginBottom:6}}>Dodge Dash</div>
                <div style={{opacity:0.8, marginBottom:14}}>Swipe to move • Avoid obstacles • Collect coins</div>
                <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                  <button onClick={handleStart} className="play-btn">Play</button>
                  <button onClick={()=> { onExit(); resetPowerUps(); }} className="small-btn">Exit</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="controls" style={{marginTop:12}}>
        <select value={skin} onChange={(e)=> setSkin(e.target.value)} className="small-btn" style={{minWidth:120}}>
          {DEFAULT_SKINS.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div style={{display:"flex", gap:8}}>
          <button className="small-btn" onClick={()=> { usePowerUp("slow"); playSfx("perfect"); }}>Slow-mo</button>
          <button className="small-btn" onClick={()=> { usePowerUp("shield"); playSfx("perfect"); }}>Shield</button>
        </div>
      </div>
    </div>
  );
}

// small helper for obstacle color variety
function getColor(i, dark=false){
  const palette = [
    ["#00d2ff","#3a7bd5"],
    ["#7b61ff","#ff6ad5"],
    ["#ffd166","#ff6b6b"]
  ];
  const p = palette[i % palette.length];
  return dark ? p[1] : p[0];
}
